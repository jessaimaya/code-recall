/**
 * Utility functions for formatting data
 */

export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds: number = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes: number = Math.floor(seconds / 60);
  const remainingSeconds: number = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}m ${remainingSeconds}s` 
      : `${minutes}m`;
  }
  
  const hours: number = Math.floor(minutes / 60);
  const remainingMinutes: number = minutes % 60;
  
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m` 
    : `${hours}h`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (value < 0 || value > 1) {
    throw new Error('Percentage value must be between 0 and 1');
  }
  
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatChallengeCount = (count: number): string => {
  if (count === 0) {
    return 'No challenges';
  }
  
  if (count === 1) {
    return '1 challenge';
  }
  
  return `${count} challenges`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (maxLength <= 0) {
    throw new Error('Max length must be greater than 0');
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.slice(0, maxLength - 3)}...`;
};