import { describe, it, expect } from "vitest";
import { scheduleCard, getDueCards, type FSRSCard } from "./fsrs";
import { Rating } from "./rating";

function newCard(overrides: Partial<FSRSCard> = {}): FSRSCard {
  return {
    stability: 0,
    difficulty: 0,
    dueDate: new Date().toISOString(),
    lastReview: null,
    reps: 0,
    lapses: 0,
    state: "NEW",
    ...overrides,
  };
}

const NOW = new Date("2024-01-01T12:00:00Z");

// ─── scheduleCard — NEW card, all 4 ratings ───────────────────────────────────

describe("scheduleCard — NEW card", () => {
  it("Again: stays in LEARNING, dueDate is in the near future", () => {
    const { card } = scheduleCard(newCard(), Rating.Again, NOW);
    expect(card.state).toBe("LEARNING");
    expect(new Date(card.dueDate) > NOW).toBe(true);
  });

  it("Hard: transitions to LEARNING", () => {
    const { card } = scheduleCard(newCard(), Rating.Hard, NOW);
    expect(card.state).toBe("LEARNING");
    expect(new Date(card.dueDate) > NOW).toBe(true);
  });

  it("Good: transitions to LEARNING", () => {
    const { card } = scheduleCard(newCard(), Rating.Good, NOW);
    expect(card.state).toBe("LEARNING");
    expect(new Date(card.dueDate) > NOW).toBe(true);
  });

  it("Easy: graduates directly to REVIEW", () => {
    const { card } = scheduleCard(newCard(), Rating.Easy, NOW);
    expect(card.state).toBe("REVIEW");
    expect(new Date(card.dueDate) > NOW).toBe(true);
  });

  it("Good: reps increments", () => {
    const { card } = scheduleCard(newCard(), Rating.Good, NOW);
    expect(card.reps).toBeGreaterThan(0);
  });
});

// ─── scheduleCard — REVIEW card, all 4 ratings ───────────────────────────────

function reviewCard(): FSRSCard {
  return newCard({
    state: "REVIEW",
    stability: 10,
    difficulty: 5,
    reps: 3,
    lapses: 0,
    lastReview: new Date("2023-12-22T12:00:00Z").toISOString(),
    dueDate: NOW.toISOString(),
  });
}

describe("scheduleCard — REVIEW card", () => {
  it("Again: lapses increments, state becomes RELEARNING", () => {
    const { card } = scheduleCard(reviewCard(), Rating.Again, NOW);
    expect(card.lapses).toBeGreaterThan(0);
    expect(card.state).toBe("RELEARNING");
  });

  it("Hard: stays in REVIEW, dueDate is in the future", () => {
    const { card } = scheduleCard(reviewCard(), Rating.Hard, NOW);
    expect(card.state).toBe("REVIEW");
    expect(new Date(card.dueDate) > NOW).toBe(true);
  });

  it("Good: stays in REVIEW, dueDate is in the future", () => {
    const { card } = scheduleCard(reviewCard(), Rating.Good, NOW);
    expect(card.state).toBe("REVIEW");
    expect(new Date(card.dueDate) > NOW).toBe(true);
  });

  it("Easy: stays in REVIEW, dueDate further out than Good", () => {
    const { card: goodCard } = scheduleCard(reviewCard(), Rating.Good, NOW);
    const { card: easyCard } = scheduleCard(reviewCard(), Rating.Easy, NOW);
    expect(new Date(easyCard.dueDate) > new Date(goodCard.dueDate)).toBe(true);
  });
});

// ─── scheduleCard — ReviewLog ─────────────────────────────────────────────────

describe("scheduleCard — ReviewLog", () => {
  it("log.reviewAt matches the supplied now", () => {
    const { log } = scheduleCard(newCard(), Rating.Good, NOW);
    expect(log.reviewAt).toBe(NOW.toISOString());
  });

  it("log.rating matches the supplied rating", () => {
    const { log } = scheduleCard(newCard(), Rating.Hard, NOW);
    expect(log.rating).toBe(Rating.Hard);
  });

  it("log.scheduledDays >= 0", () => {
    const { log } = scheduleCard(newCard(), Rating.Good, NOW);
    expect(log.scheduledDays).toBeGreaterThanOrEqual(0);
  });
});

// ─── getDueCards ──────────────────────────────────────────────────────────────

describe("getDueCards", () => {
  const past = new Date("2023-12-01T00:00:00Z").toISOString();
  const future = new Date("2025-01-01T00:00:00Z").toISOString();

  const cards: FSRSCard[] = [
    newCard({ dueDate: past }),
    newCard({ dueDate: NOW.toISOString() }), // exactly now — due
    newCard({ dueDate: future }),
  ];

  it("returns cards with dueDate <= now", () => {
    const due = getDueCards(cards, NOW);
    expect(due).toHaveLength(2);
  });

  it("excludes cards with dueDate in the future", () => {
    const due = getDueCards(cards, NOW);
    due.forEach((c) => expect(new Date(c.dueDate) <= NOW).toBe(true));
  });

  it("returns empty array when no cards are due", () => {
    const due = getDueCards([newCard({ dueDate: future })], NOW);
    expect(due).toHaveLength(0);
  });

  it("preserves extra fields on subtype", () => {
    type ExtCard = FSRSCard & { id: string };
    const extCards: ExtCard[] = [{ ...newCard({ dueDate: past }), id: "abc" }];
    const due = getDueCards(extCards, NOW);
    expect(due[0].id).toBe("abc");
  });
});
