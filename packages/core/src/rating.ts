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
