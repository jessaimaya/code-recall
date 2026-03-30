export interface MCPromptParams {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export function buildMultipleChoicePrompt({ topic, difficulty }: MCPromptParams): string {
  return `You are an expert creating multiple choice questions for developer knowledge assessment.

Generate a ${difficulty} difficulty multiple choice question about "${topic}".

Requirements:
- Exactly 4 options (ids: "a", "b", "c", "d")
- Exactly 1 correct answer
- Distractors must be plausibly wrong — not obviously incorrect
- Every option must have a clear explanation of why it is correct or incorrect
- No duplicate options
- Tags should be specific sub-topics related to the question`;
}
