import { formatDuration, formatPercentage, formatChallengeCount, truncateText } from '../../utils/formatters';

describe('Formatters', () => {
  describe('formatDuration', () => {
    it('should format milliseconds correctly', () => {
      expect(formatDuration(500)).toBe('500ms');
      expect(formatDuration(999)).toBe('999ms');
    });

    it('should format seconds correctly', () => {
      expect(formatDuration(1000)).toBe('1s');
      expect(formatDuration(5000)).toBe('5s');
      expect(formatDuration(59000)).toBe('59s');
    });

    it('should format minutes correctly', () => {
      expect(formatDuration(60000)).toBe('1m');
      expect(formatDuration(90000)).toBe('1m 30s');
      expect(formatDuration(120000)).toBe('2m');
      expect(formatDuration(3540000)).toBe('59m');
    });

    it('should format hours correctly', () => {
      expect(formatDuration(3600000)).toBe('1h');
      expect(formatDuration(5400000)).toBe('1h 30m');
      expect(formatDuration(7200000)).toBe('2h');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with default decimals', () => {
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(0.123)).toBe('12.3%');
      expect(formatPercentage(0.999)).toBe('99.9%');
    });

    it('should format percentages with custom decimals', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%');
      expect(formatPercentage(0.5, 0)).toBe('50%');
    });

    it('should handle edge cases', () => {
      expect(formatPercentage(0)).toBe('0.0%');
      expect(formatPercentage(1)).toBe('100.0%');
    });

    it('should throw error for invalid values', () => {
      expect(() => formatPercentage(-0.1)).toThrow('Percentage value must be between 0 and 1');
      expect(() => formatPercentage(1.1)).toThrow('Percentage value must be between 0 and 1');
    });
  });

  describe('formatChallengeCount', () => {
    it('should format zero challenges', () => {
      expect(formatChallengeCount(0)).toBe('No challenges');
    });

    it('should format single challenge', () => {
      expect(formatChallengeCount(1)).toBe('1 challenge');
    });

    it('should format multiple challenges', () => {
      expect(formatChallengeCount(2)).toBe('2 challenges');
      expect(formatChallengeCount(10)).toBe('10 challenges');
      expect(formatChallengeCount(100)).toBe('100 challenges');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
      expect(truncateText('Hello World', 11)).toBe('Hello World');
    });

    it('should truncate long text', () => {
      expect(truncateText('Hello World', 10)).toBe('Hello W...');
      expect(truncateText('This is a very long text', 10)).toBe('This is...');
    });

    it('should handle edge cases', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
      expect(truncateText('Hello', 4)).toBe('H...');
    });

    it('should throw error for invalid max length', () => {
      expect(() => truncateText('Hello', 0)).toThrow('Max length must be greater than 0');
      expect(() => truncateText('Hello', -1)).toThrow('Max length must be greater than 0');
    });
  });
});