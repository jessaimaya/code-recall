export interface CodingPromptParams {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  language: string;
}

export function buildCodingPrompt({ topic, difficulty, language }: CodingPromptParams): string {
  return `You are an expert programming instructor creating coding challenges for spaced repetition learning.

Generate a ${difficulty} difficulty coding challenge about "${topic}" in ${language}.

Requirements:
- The challenge must directly test "${topic}" — keep the scope focused
- Include at least 5 test cases; at least 2 must be edge cases (empty input, boundary values, null/undefined, duplicates, max values)
- Test case inputs and expected outputs must exactly match the function signature
- starter_code must compile and contain only the function signature with an empty/stub body
- Hints should be progressive: the first barely nudges, later ones reveal more
- time_complexity and space_complexity reflect the optimal solution`;
}
