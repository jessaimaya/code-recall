import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';

import type { ListOptions, Challenge } from '../../types/index';

interface ListCommandProps {
  readonly options?: ListOptions;
}

const ListCommand: React.FC<ListCommandProps> = ({ options }) => {
  const [challenges, setChallenges] = useState<readonly Challenge[]>([]);

  useEffect(() => {
    const loadChallenges = async (): Promise<void> => {
      try {
        // TODO: Implement list logic
        // - Query database with filters (due, tag, pattern)
        // - Format challenge list with metadata
        
        // Placeholder data
        const mockChallenges: readonly Challenge[] = [];
        
        setChallenges(mockChallenges);
      } catch (error: unknown) {
        console.error('Error loading challenges:', error instanceof Error ? error.message : String(error));
      }
    };

    void loadChallenges();
  }, [options]);

  return (
    <Box flexDirection="column">
      <Text color="yellow" bold>📋 Challenge List</Text>
      {challenges.length === 0 ? (
        <Text>No challenges found. Add some with 'coderecall add &lt;file&gt;'</Text>
      ) : (
        challenges.map((challenge, index) => (
          <Box key={index} marginTop={1}>
            <Text>{challenge.title}</Text>
            <Text color="gray"> - {challenge.tags?.join(', ')}</Text>
          </Box>
        ))
      )}
      {options?.due === true && (
        <Text color="gray">Showing only due challenges</Text>
      )}
      {options?.tag !== undefined && (
        <Text color="gray">Filtered by tag: {options.tag}</Text>
      )}
      {options?.pattern !== undefined && (
        <Text color="gray">Filtered by pattern: {options.pattern}</Text>
      )}
    </Box>
  );
};

export default ListCommand;