import {
  fsrs,
  generatorParameters,
  createEmptyCard,
  Rating as FSRSRating,
  State,
  type Card as TSCard,
  type RecordLogItem,
} from "ts-fsrs";
import type { Rating } from "./rating";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardState = "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";

export interface FSRSCard {
  stability: number;
  difficulty: number;
  dueDate: string; // ISO 8601
  lastReview: string | null;
  reps: number;
  lapses: number;
  state: CardState;
}

export interface ReviewLog {
  rating: Rating;
  elapsedDays: number;
  scheduledDays: number;
  reviewAt: string; // ISO 8601
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const scheduler = fsrs(generatorParameters({ request_retention: 0.9 }));

const STATE_MAP: Record<CardState, State> = {
  NEW: State.New,
  LEARNING: State.Learning,
  REVIEW: State.Review,
  RELEARNING: State.Relearning,
};

const STATE_REVERSE: Record<State, CardState> = {
  [State.New]: "NEW",
  [State.Learning]: "LEARNING",
  [State.Review]: "REVIEW",
  [State.Relearning]: "RELEARNING",
};

const RATING_MAP: Record<Rating, FSRSRating> = {
  1: FSRSRating.Again,
  2: FSRSRating.Hard,
  3: FSRSRating.Good,
  4: FSRSRating.Easy,
};

function toTSCard(card: FSRSCard): TSCard {
  const base = createEmptyCard();
  return {
    ...base,
    stability: card.stability,
    difficulty: card.difficulty,
    due: new Date(card.dueDate),
    last_review: card.lastReview ? new Date(card.lastReview) : undefined,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_MAP[card.state],
  };
}

function fromRecordLogItem(item: RecordLogItem, _rating: Rating): FSRSCard {
  const { card, log } = item;
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    dueDate: card.due.toISOString(),
    lastReview: card.last_review?.toISOString() ?? null,
    reps: card.reps,
    lapses: card.lapses,
    state: STATE_REVERSE[card.state],
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Apply a rating to a card and return the updated card state.
 */
export function scheduleCard(
  card: FSRSCard,
  rating: Rating,
  now: Date,
): { card: FSRSCard; log: ReviewLog } {
  const tsCard = toTSCard(card);
  const fsrsRating = RATING_MAP[rating];
  const recordLog = scheduler.repeat(tsCard, now);
  const item = recordLog[fsrsRating as keyof typeof recordLog] as RecordLogItem;

  const updatedCard = fromRecordLogItem(item, rating);
  const reviewLog: ReviewLog = {
    rating,
    elapsedDays: item.log.elapsed_days,
    scheduledDays: item.log.scheduled_days,
    reviewAt: now.toISOString(),
  };

  return { card: updatedCard, log: reviewLog };
}

/**
 * Return cards whose dueDate is on or before `now`.
 */
export function getDueCards<T extends FSRSCard>(cards: T[], now: Date): T[] {
  return cards.filter((c) => new Date(c.dueDate) <= now);
}
