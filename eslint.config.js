import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Disable base rules for TypeScript files where needed
      'no-unused-vars': 'off',
      'no-undef': 'off', // TypeScript handles this
      
      // Essential strict JavaScript rules that work with TypeScript
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'eqeqeq': ['error', 'always'],
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'no-param-reassign': 'error',
      'no-return-await': 'error',
      'spaced-comment': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-with': 'error',
      'no-alert': 'error',
      'no-throw-literal': 'error',
      'no-sequences': 'error',
      'no-unused-expressions': 'error',
      'yoda': 'error',
      'prefer-spread': 'error',
      'prefer-rest-params': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-duplicate-imports': 'error',
      
      // Code quality
      'complexity': ['error', 20],
      'max-depth': ['error', 5],
      'max-lines-per-function': ['error', 150],
      'max-params': ['error', 7],
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      'eslint.config.js',
    ],
  },
];