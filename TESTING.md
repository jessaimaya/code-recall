# Testing & Coverage Guide

This project enforces strict testing standards with a minimum coverage threshold of **75%** for all utility functions and core business logic.

## Coverage Configuration

The project uses Jest with the following coverage requirements:

- **Statements**: 75% minimum
- **Branches**: 75% minimum  
- **Functions**: 75% minimum
- **Lines**: 75% minimum

## Running Tests

### Basic Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
```

### Coverage Reports
```bash
npm run test:coverage    # Run tests with coverage report
npm run test:coverage-check  # Run coverage check (used in pre-commit)
```

## Pre-commit Hooks

The project automatically enforces quality standards before each commit:

1. **TypeScript Type Check**: Validates type safety with strict rules
2. **Test Coverage**: Ensures minimum 75% coverage on utils and types
3. **ESLint**: Checks code style and quality

### Pre-commit Hook Commands
The hook runs these commands in sequence:
```bash
npm run typecheck          # TypeScript type checking
npm run test:coverage-check # Jest with coverage validation
npm run lint               # ESLint code quality check
```

If any command fails, the commit is blocked until issues are resolved.

### What Gets Checked

Currently, coverage checking is focused on:
- `src/utils/**/*.{ts,tsx}` - Utility functions
- `src/types/**/*.{ts,tsx}` - Type definitions

### Coverage Reports

After running coverage, reports are generated in multiple formats:
- **Terminal**: Immediate feedback with coverage percentages
- **HTML**: Detailed report in `coverage/lcov-report/index.html`
- **LCOV**: Machine-readable format in `coverage/lcov.info`
- **JSON**: Summary data in `coverage/coverage-summary.json`

## Writing Tests

### Test File Naming
- Unit tests: `*.test.ts` or `*.test.tsx`
- Test directories: `__tests__/`

### Test Structure
```typescript
import { functionToTest } from '../utils/myModule';

describe('MyModule', () => {
  describe('functionToTest', () => {
    it('should handle normal cases', () => {
      expect(functionToTest('input')).toBe('expected');
    });

    it('should handle edge cases', () => {
      expect(() => functionToTest('')).toThrow('Error message');
    });
  });
});
```

### Coverage Requirements

To pass the pre-commit hook, ensure your code has:
- Tests for all public functions
- Tests for all branches/conditions
- Tests for error cases
- Tests for edge cases

## Continuous Integration

The same coverage checks run locally will be enforced in CI/CD pipelines, ensuring code quality across all environments.