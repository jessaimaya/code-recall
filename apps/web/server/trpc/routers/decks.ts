import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { db } from "../../db";
import { decks } from "@repo/db";
import { randomUUID } from "crypto";

export const decksRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.select().from(decks).where(eq(decks.userId, ctx.userId));
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const [deck] = await db
      .select()
      .from(decks)
      .where(and(eq(decks.id, input.id), eq(decks.userId, ctx.userId)));
    if (!deck) throw new TRPCError({ code: "NOT_FOUND" });
    return deck;
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const id = randomUUID();
      await db
        .insert(decks)
        .values({ id, userId: ctx.userId, name: input.name, description: input.description });
      return { id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deck] = await db
        .select()
        .from(decks)
        .where(and(eq(decks.id, input.id), eq(decks.userId, ctx.userId)));
      if (!deck) throw new TRPCError({ code: "NOT_FOUND" });
      await db.delete(decks).where(eq(decks.id, input.id));
      return { success: true };
    }),
});
