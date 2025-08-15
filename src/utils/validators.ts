/**
 * Validation utilities for the application
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isNonEmptyString = (value: string): boolean => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0;
};

export const isValidPercentage = (value: number): boolean => {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0 && value <= 100;
};

export const hasMinLength = (value: string, minLength: number): boolean => {
  return typeof value === 'string' && value.length >= minLength;
};

export const isValidTag = (tag: string): boolean => {
  // Tags should be non-empty, contain only alphanumeric characters, hyphens, and underscores
  const tagRegex = /^[a-zA-Z0-9_-]+$/;
  return isNonEmptyString(tag) && tagRegex.test(tag) && tag.length <= 50;
};

export const isValidDifficulty = (difficulty: number): boolean => {
  // Difficulty should be between 1 and 10
  return isPositiveNumber(difficulty) && difficulty >= 1 && difficulty <= 10;
};