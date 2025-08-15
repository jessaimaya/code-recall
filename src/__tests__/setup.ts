import '@testing-library/jest-dom';

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]): void => {
    // Suppress React warnings in tests unless they're actual errors
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning:')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]): void => {
    // Suppress common warnings in test environment
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillMount') || args[0].includes('Warning:'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});