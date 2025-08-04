# Challenge Generator Prompt Template

Use this prompt to generate comprehensive coding challenges for CodeRecall CLI:

---

## Prompt:

Generate a complete coding challenge following the CodeRecall format specification. The challenge should include:

**Required YAML Frontmatter:**
- `id`: Generate a realistic SHA-256 hash (64 hex characters)
- `title`: Clear, descriptive title
- `author`: Use "CodeRecall Community" 
- `source`: Use "coderecall-challenges"
- `tags`: 3-5 relevant tags (language, category, concepts)
- `pattern`: Main algorithmic/design pattern
- `created_at`: Use today's date (2025-08-03)
- `version`: Start with 1

**Challenge Content Structure:**
1. **Problem Statement** - Clear, concise description of what to implement
2. **Function Signature** - Exact function signature(s) to implement
3. **Parameters** - Detailed parameter descriptions with types
4. **Return Value** - What the function should return
5. **Examples** - At least 3-4 comprehensive examples with inputs/outputs
6. **Edge Cases** - Important edge cases to consider
7. **Constraints** - Time/space complexity requirements, input limits
8. **Test Cases** - Complete test suite with:
   - Basic functionality tests
   - Edge case tests  
   - Performance tests (if applicable)
   - Error handling tests
9. **Hints** (optional) - Subtle guidance without giving away solution
10. **Follow-up Questions** - 2-3 related questions for deeper understanding

**Test Case Requirements:**
- Use Jest/Vitest syntax for JavaScript/TypeScript
- Include setup/teardown if needed
- Generate TWO levels of tests:
  1. **Basic Tests** (4-5 tests): Cover fundamental functionality to help developers get started
  2. **Full Evaluation Tests** (8-15 tests): Comprehensive test suite covering edge cases, error conditions, performance, and corner cases for final submission evaluation
- Add timing tests for performance-critical functions
- Basic tests should be included in the boilerplate file
- Full evaluation tests should be in a separate `.test.js` or `.spec.js` file

**Challenge Topic:** [SPECIFY THE TOPIC/ALGORITHM HERE]

**Programming Language:** [SPECIFY LANGUAGE - JavaScript, Python, etc.]

**Difficulty Level:** [Easy/Medium/Hard]

**Additional Context:** [Any specific requirements, real-world applications, or constraints]

---

Generate THREE files:

1. **Challenge markdown file** - Complete challenge description following the format above

2. **Coding boilerplate file** - Starter template with:
   - Function signature ready to implement
   - JSDoc comments with parameter/return types
   - TODO comments for implementation
   - Example usage (commented out)
   - Basic test cases (4-5 tests) to help developers get started
   - Proper imports/exports

3. **Full evaluation test file** - Comprehensive test suite with:
   - All basic functionality tests
   - Edge case coverage
   - Error handling tests
   - Performance tests (if applicable)
   - Corner cases and boundary conditions
   - 8-15 total test cases for thorough evaluation

The boilerplate should use the template in `challenge-boilerplate-template.js`, replacing placeholders like [FUNCTION_NAME], [PARAMETERS], [CHALLENGE_TITLE], etc. with actual values from the challenge.

All three files should work together: developers can start with the boilerplate and basic tests, then their final solution will be evaluated against the comprehensive test suite.