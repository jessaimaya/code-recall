import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const CardType = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  CODING: "CODING",
  OPEN_ENDED: "OPEN_ENDED",
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

export const CardState = {
  NEW: "NEW",
  LEARNING: "LEARNING",
  REVIEW: "REVIEW",
  RELEARNING: "RELEARNING",
} as const;
export type CardState = (typeof CardState)[keyof typeof CardState];

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export const decks = sqliteTable("decks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export const cards = sqliteTable("cards", {
  id: text("id").primaryKey(),
  deckId: text("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  cardType: text("card_type").$type<CardType>().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  // FSRS scheduling columns
  stability: real("stability").notNull().default(0),
  difficulty: real("difficulty").notNull().default(0),
  dueDate: text("due_date")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  lastReview: text("last_review"),
  reps: integer("reps").notNull().default(0),
  lapses: integer("lapses").notNull().default(0),
  state: text("state").$type<CardState>().notNull().default("NEW"),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1–4
  elapsedDays: real("elapsed_days").notNull(),
  scheduledDays: real("scheduled_days").notNull(),
  reviewAt: text("review_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  // null = not yet pushed to Turso; set on successful sync
  syncedAt: text("synced_at"),
});

export const testCases = sqliteTable("test_cases", {
  id: text("id").primaryKey(),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
  description: text("description"),
});

export const options = sqliteTable("options", {
  id: text("id").primaryKey(),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false),
  explanation: text("explanation"),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Deck = InferSelectModel<typeof decks>;
export type NewDeck = InferInsertModel<typeof decks>;

export type Card = InferSelectModel<typeof cards>;
export type NewCard = InferInsertModel<typeof cards>;

export type Review = InferSelectModel<typeof reviews>;
export type NewReview = InferInsertModel<typeof reviews>;

export type TestCase = InferSelectModel<typeof testCases>;
export type NewTestCase = InferInsertModel<typeof testCases>;

export type Option = InferSelectModel<typeof options>;
export type NewOption = InferInsertModel<typeof options>;
