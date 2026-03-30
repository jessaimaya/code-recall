/** FSRS rating scale (1 = Again … 4 = Easy) */
export const Rating = {
  Again: 1,
  Hard: 2,
  Good: 3,
  Easy: 4,
} as const;

export type Rating = (typeof Rating)[keyof typeof Rating];

export function isValidRating(value: number): value is Rating {
  return value >= 1 && value <= 4 && Number.isInteger(value);
}

/**
 * Convert a test-result pass percentage to an FSRS rating.
 *
 *  0%        → Again (1)  — nothing passed
 *  1 – 49%   → Hard  (2)  — partial, less than half
 *  50 – 99%  → Good  (3)  — majority passed but not perfect
 *  100%      → Easy  (4)  — all tests passed on first attempt
 *
 * @param passPercent Integer 0–100 representing the percentage of test cases passed.
 */
export function testResultToRating(passPercent: number): Rating {
  if (passPercent <= 0) return Rating.Again;
  if (passPercent < 50) return Rating.Hard;
  if (passPercent < 100) return Rating.Good;
  return Rating.Easy;
}
