import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';

import type { StatsOptions, Statistics } from '../../types/index';

interface StatsCommandProps {
  readonly options?: StatsOptions;
}

const StatsCommand: React.FC<StatsCommandProps> = ({ options }) => {
  const [stats, setStats] = useState<Statistics | null>(null);

  useEffect(() => {
    const loadStats = async (): Promise<void> => {
      try {
        // TODO: Implement stats logic
        // - Query database for progress statistics
        // - Calculate review streaks, success rates
        // - Format output as table or JSON
        
        // Placeholder data
        const mockStats: Statistics = {
          totalChallenges: 0,
          dueToday: 0,
          averageRating: 0,
          currentStreak: 0,
          totalReviews: 0
        };
        
        setStats(mockStats);
      } catch (error: unknown) {
        console.error('Error loading stats:', error instanceof Error ? error.message : String(error));
      }
    };

    void loadStats();
  }, [options]);

  if (!stats) {
    return <Text>Loading statistics...</Text>;
  }

  if (options?.format === 'json') {
    return <Text>{JSON.stringify(stats, null, 2)}</Text>;
  }

  return (
    <Box flexDirection="column">
      <Text color="cyan" bold>📊 Progress Statistics</Text>
      <Box marginTop={1}>
        <Text>Total Challenges: {stats.totalChallenges}</Text>
      </Box>
      <Box>
        <Text>Due Today: {stats.dueToday}</Text>
      </Box>
      <Box>
        <Text>Current Streak: {stats.currentStreak} days</Text>
      </Box>
      <Box>
        <Text>Total Reviews: {stats.totalReviews}</Text>
      </Box>
      <Box>
        <Text>Average Rating: {stats.averageRating.toFixed(1)}/4.0</Text>
      </Box>
    </Box>
  );
};

export default StatsCommand;