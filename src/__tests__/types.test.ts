import { ReviewRating, type Statistics, type Challenge, type ReviewOptions, type AddOptions } from '../types/index';

describe('Types', () => {
  describe('ReviewRating enum', () => {
    it('should have correct numeric values', () => {
      expect(ReviewRating.Again).toBe(1);
      expect(ReviewRating.Hard).toBe(2);
      expect(ReviewRating.Good).toBe(3);
      expect(ReviewRating.Easy).toBe(4);
    });
  });

  describe('Statistics interface', () => {
    it('should accept valid statistics object', () => {
      const stats: Statistics = {
        totalChallenges: 10,
        dueToday: 3,
        averageRating: 3.2,
        currentStreak: 5,
        totalReviews: 25
      };

      expect(stats.totalChallenges).toBe(10);
      expect(stats.dueToday).toBe(3);
      expect(stats.averageRating).toBe(3.2);
      expect(stats.currentStreak).toBe(5);
      expect(stats.totalReviews).toBe(25);
    });
  });

  describe('Challenge interface', () => {
    it('should accept valid challenge object', () => {
      const challenge: Challenge = {
        id: 'test-id',
        title: 'Test Challenge',
        filePath: '/path/to/file.md',
        author: 'Test Author',
        source: 'https://example.com',
        tags: ['javascript', 'algorithms'],
        pattern: 'two-pointers',
        createdAt: new Date('2023-01-01'),
        version: 1,
        lastModified: new Date('2023-01-02'),
        contentHash: 'abc123',
        content: '# Test Content'
      };

      expect(challenge.id).toBe('test-id');
      expect(challenge.title).toBe('Test Challenge');
      expect(challenge.tags).toEqual(['javascript', 'algorithms']);
      expect(challenge.version).toBe(1);
    });
  });

  describe('Options interfaces', () => {
    it('should accept valid ReviewOptions', () => {
      const options: ReviewOptions = {
        editor: 'code',
        count: '5'
      };

      expect(options.editor).toBe('code');
      expect(options.count).toBe('5');
    });

    it('should accept valid AddOptions', () => {
      const options: AddOptions = {
        verify: true
      };

      expect(options.verify).toBe(true);
    });
  });
});