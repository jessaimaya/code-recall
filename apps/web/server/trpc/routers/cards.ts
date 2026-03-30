import { z } from "zod";
import { eq, and, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  fsrs,
  generatorParameters,
  Rating,
  State,
  createEmptyCard,
  type Grade,
  type Card as FsrsCard,
} from "ts-fsrs";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { cards, decks, reviews, type Card } from "@repo/db";
import { randomUUID } from "crypto";

const f = fsrs(generatorParameters({ request_retention: 0.9 }));

const RATING_MAP: Record<number, Grade> = {
  1: Rating.Again,
  2: Rating.Hard,
  3: Rating.Good,
  4: Rating.Easy,
};

const STATE_MAP: Record<string, State> = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning,
};

const STATE_REVERSE: Record<number, Card["state"]> = {
  [State.New]: "NEW",
  [State.Learning]: "LEARNING",
  [State.Review]: "REVIEW",
  [State.Relearning]: "RELEARNING",
};

function toFsrsCard(card: Card): FsrsCard {
  const base = createEmptyCard();
  return {
    ...base,
    due: new Date(card.dueDate),
    stability: card.stability,
    difficulty: card.difficulty,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_MAP[card.state] ?? State.New,
    last_review: card.lastReview ? new Date(card.lastReview) : undefined,
  };
}

export const cardsRouter = router({
  getDue: protectedProcedure
    .input(z.object({ deckId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [deck] = await db
        .select()
        .from(decks)
        .where(and(eq(decks.id, input.deckId), eq(decks.userId, ctx.userId)));
      if (!deck) throw new TRPCError({ code: "NOT_FOUND" });

      const now = new Date().toISOString();
      return db
        .select()
        .from(cards)
        .where(and(eq(cards.deckId, input.deckId), lte(cards.dueDate, now)));
    }),

  schedule: protectedProcedure
    .input(z.object({ cardId: z.string(), rating: z.number().int().min(1).max(4) }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await db
        .select({ card: cards, userId: decks.userId })
        .from(cards)
        .innerJoin(decks, eq(cards.deckId, decks.id))
        .where(eq(cards.id, input.cardId));

      if (!row || row.userId !== ctx.userId) throw new TRPCError({ code: "NOT_FOUND" });

      const now = new Date();
      const fsrsCard = toFsrsCard(row.card);
      const grade = RATING_MAP[input.rating]!;
      const recordLog = f.repeat(fsrsCard, now);
      const record = recordLog[grade];
      const next = record.card;
      const log = record.log;

      await db.transaction(async (tx) => {
        await tx
          .update(cards)
          .set({
            stability: next.stability,
            difficulty: next.difficulty,
            dueDate: next.due.toISOString(),
            lastReview: now.toISOString(),
            reps: next.reps,
            lapses: next.lapses,
            state: STATE_REVERSE[next.state] ?? "NEW",
          })
          .where(eq(cards.id, input.cardId));

        await tx.insert(reviews).values({
          id: randomUUID(),
          cardId: input.cardId,
          rating: input.rating,
          elapsedDays: log.elapsed_days,
          scheduledDays: log.scheduled_days,
          reviewAt: now.toISOString(),
        });
      });

      return { success: true, dueDate: next.due.toISOString() };
    }),
});
