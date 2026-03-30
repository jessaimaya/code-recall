import { describe, it, expect } from "vitest";
import { Rating, isValidRating } from "./rating";

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
