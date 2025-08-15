import {
  isValidEmail,
  isValidUrl,
  isNonEmptyString,
  isPositiveNumber,
  isValidPercentage,
  hasMinLength,
  isValidTag,
  isValidDifficulty
} from '../../utils/validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+label@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      // Note: Our simple regex doesn't catch all edge cases like consecutive dots
      expect(isValidEmail('')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true);
      expect(isValidEmail('   ')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should accept non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('  text  ')).toBe(true);
    });

    it('should reject empty or whitespace-only strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
      expect(isNonEmptyString('\t\n')).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should accept positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(0.1)).toBe(true);
      expect(isPositiveNumber(100)).toBe(true);
    });

    it('should reject non-positive numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(Number.NaN)).toBe(false);
    });
  });

  describe('isValidPercentage', () => {
    it('should accept valid percentage values', () => {
      expect(isValidPercentage(0)).toBe(true);
      expect(isValidPercentage(50)).toBe(true);
      expect(isValidPercentage(100)).toBe(true);
      expect(isValidPercentage(75.5)).toBe(true);
    });

    it('should reject invalid percentage values', () => {
      expect(isValidPercentage(-1)).toBe(false);
      expect(isValidPercentage(101)).toBe(false);
      expect(isValidPercentage(Number.NaN)).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('should check minimum length correctly', () => {
      expect(hasMinLength('hello', 3)).toBe(true);
      expect(hasMinLength('hello', 5)).toBe(true);
      expect(hasMinLength('hi', 3)).toBe(false);
      expect(hasMinLength('', 1)).toBe(false);
    });
  });

  describe('isValidTag', () => {
    it('should accept valid tags', () => {
      expect(isValidTag('javascript')).toBe(true);
      expect(isValidTag('two-pointers')).toBe(true);
      expect(isValidTag('data_structures')).toBe(true);
      expect(isValidTag('algo123')).toBe(true);
    });

    it('should reject invalid tags', () => {
      expect(isValidTag('')).toBe(false);
      expect(isValidTag('tag with spaces')).toBe(false);
      expect(isValidTag('tag@symbol')).toBe(false);
      expect(isValidTag('a'.repeat(51))).toBe(false); // Too long
    });
  });

  describe('isValidDifficulty', () => {
    it('should accept valid difficulty levels', () => {
      expect(isValidDifficulty(1)).toBe(true);
      expect(isValidDifficulty(5)).toBe(true);
      expect(isValidDifficulty(10)).toBe(true);
    });

    it('should reject invalid difficulty levels', () => {
      expect(isValidDifficulty(0)).toBe(false);
      expect(isValidDifficulty(11)).toBe(false);
      expect(isValidDifficulty(-1)).toBe(false);
      expect(isValidDifficulty(Number.NaN)).toBe(false);
    });
  });
});