export interface OEGenerateParams {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export function buildOpenEndedGeneratePrompt({ topic, difficulty }: OEGenerateParams): string {
  return `You are an expert creating open-ended questions for developer knowledge assessment.

Generate a ${difficulty} difficulty open-ended question about "${topic}".

Requirements:
- The question should require conceptual understanding, not just recall
- model_answer must be comprehensive yet concise (2–4 sentences)
- evaluation_criteria should list the key concepts a complete answer must cover
- Tags should reflect relevant sub-topics`;
}

export interface OEEvalParams {
  question: string;
  userAnswer: string;
  modelAnswer?: string;
}

export function buildOpenEndedEvalPrompt({
  question,
  userAnswer,
  modelAnswer,
}: OEEvalParams): string {
  const ref = modelAnswer ? `\nReference answer: ${modelAnswer}` : "";
  return `You are an expert grading developer knowledge answers.

Question: ${question}${ref}

User answer: ${userAnswer}

Evaluate and return:
- score: 1–4 (1=Again — doesn't understand, 2=Hard — partial, 3=Good — solid, 4=Easy — mastery)
- feedback: constructive, specific, under 100 words
- missing_concepts: short phrases for concepts absent or underdeveloped in the answer
- suggested_rating: same value as score (direct FSRS rating)`;
}
