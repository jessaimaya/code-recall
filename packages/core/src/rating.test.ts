import { describe, it, expect } from "vitest";
import { Rating, isValidRating, testResultToRating } from "./rating";

describe("isValidRating", () => {
  it("accepts all four FSRS ratings", () => {
    expect(isValidRating(Rating.Again)).toBe(true);
    expect(isValidRating(Rating.Hard)).toBe(true);
    expect(isValidRating(Rating.Good)).toBe(true);
    expect(isValidRating(Rating.Easy)).toBe(true);
  });

  it("rejects values outside 1–4", () => {
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(5)).toBe(false);
  });

  it("rejects non-integer values", () => {
    expect(isValidRating(2.5)).toBe(false);
  });
});

describe("testResultToRating", () => {
  it("0% → Again", () => {
    expect(testResultToRating(0)).toBe(Rating.Again);
  });

  it("negative % → Again (treated as 0)", () => {
    expect(testResultToRating(-1)).toBe(Rating.Again);
  });

  it("1% → Hard", () => {
    expect(testResultToRating(1)).toBe(Rating.Hard);
  });

  it("49% → Hard", () => {
    expect(testResultToRating(49)).toBe(Rating.Hard);
  });

  it("50% → Good", () => {
    expect(testResultToRating(50)).toBe(Rating.Good);
  });

  it("99% → Good", () => {
    expect(testResultToRating(99)).toBe(Rating.Good);
  });

  it("100% → Easy", () => {
    expect(testResultToRating(100)).toBe(Rating.Easy);
  });
});
