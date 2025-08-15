import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';

import type { ReviewOptions } from '../../types/index';

interface ReviewCommandProps {
  readonly options?: ReviewOptions;
}

const ReviewCommand: React.FC<ReviewCommandProps> = ({ options }) => {
  const [status, setStatus] = useState<string>('Loading...');

  useEffect(() => {
    const runReview = async (): Promise<void> => {
      try {
        // TODO: Implement review logic
        // - Get due challenges from database
        // - Open editor for each challenge
        // - Record user's performance rating
        // - Update spaced repetition schedule
        
        setStatus(`Review started with editor: ${options?.editor ?? 'default'}, count: ${options?.count ?? '10'}`);
        
        // Placeholder implementation
        setTimeout(() => {
          setStatus('Review completed! No challenges due at this time.');
        }, 1000);
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : String(error);
        setStatus(`Error: ${errorMessage}`);
      }
    };

    void runReview();
  }, [options]);

  return (
    <Box flexDirection="column">
      <Text color="green">📚 Review Mode</Text>
      <Text>{status}</Text>
    </Box>
  );
};

export default ReviewCommand;