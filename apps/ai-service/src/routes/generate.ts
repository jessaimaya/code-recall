import { Hono } from "hono";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL } from "../lib/anthropic";
import { AppError, handleError } from "../lib/errors";
import { buildCodingPrompt } from "../prompts/coding-v1";
import { buildMultipleChoicePrompt } from "../prompts/multiple-choice-v1";
import { buildOpenEndedGeneratePrompt } from "../prompts/open-ended-v1";
import { db } from "../lib/db";
import { cards, decks } from "@repo/db";

export const generateRoutes = new Hono();

// ─── Output schemas ───────────────────────────────────────────────────────────

const TestCaseSchema = z.object({
  input: z.string().describe("Input to the function as a string"),
  expected_output: z.string().describe("Expected output as a string"),
  is_edge_case: z.boolean().describe("True if this is an edge case"),
  description: z.string().describe("What this test case validates"),
});

const CodingChallengeSchema = z.object({
  title: z.string().describe("Short descriptive title"),
  description: z.string().describe("Full problem statement"),
  function_signature: z.string().describe("Function signature in the target language"),
  starter_code: z.string().describe("Compilable stub with empty body"),
  test_cases: z.array(TestCaseSchema).describe("Minimum 5 test cases, at least 2 edge cases"),
  hints: z.array(z.string()).describe("Progressive hints, easiest first"),
  time_complexity: z.string().describe("Optimal time complexity, e.g. O(n log n)"),
  space_complexity: z.string().describe("Optimal space complexity, e.g. O(1)"),
});

const OptionSchema = z.object({
  id: z.string().describe("Single letter: a, b, c, or d"),
  body: z.string().describe("Option text"),
  is_correct: z.boolean().describe("True for the correct option"),
  explanation: z.string().describe("Why this option is right or wrong"),
});

const MultipleChoiceSchema = z.object({
  question: z.string().describe("The question text"),
  options: z.array(OptionSchema).describe("Exactly 4 options, exactly 1 correct"),
  overall_explanation: z.string().describe("Full explanation of the correct answer"),
  tags: z.array(z.string()).describe("Relevant sub-topic tags"),
});

const OpenEndedSchema = z.object({
  question: z.string().describe("The open-ended question"),
  model_answer: z.string().describe("A comprehensive model answer (2–4 sentences)"),
  evaluation_criteria: z.array(z.string()).describe("Key concepts a complete answer must cover"),
  tags: z.array(z.string()).describe("Relevant sub-topic tags"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DifficultySchema = z.enum(["easy", "medium", "hard"]);

async function callClaude<T>(prompt: string, schema: z.ZodType<T>, retries = 1): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      messages: [{ role: "user", content: prompt }],
      output_config: { format: zodOutputFormat(schema) },
    });
    if (response.parsed_output !== null) return response.parsed_output as T;
  }
  throw new AppError("GENERATION_FAILED", "Failed to generate a valid response after retry", 500);
}

// ─── POST /generate/coding ────────────────────────────────────────────────────

const CodingInputSchema = z.object({
  topic: z.string().min(1),
  difficulty: DifficultySchema,
  language: z.string().min(1),
  count: z.number().int().min(1).max(10).optional().default(1),
});

generateRoutes.post("/coding", async (c) => {
  try {
    const body = await c.req.json();
    const input = CodingInputSchema.safeParse(body);
    if (!input.success) {
      throw new AppError("VALIDATION_ERROR", input.error.message);
    }
    const { topic, difficulty, language, count } = input.data;
    const prompt = buildCodingPrompt({ topic, difficulty, language });

    const challenges = await Promise.all(
      Array.from({ length: count }, () => callClaude(prompt, CodingChallengeSchema)),
    );

    return c.json({ challenges });
  } catch (error) {
    return handleError(c, error);
  }
});

// ─── POST /generate/multiple-choice ──────────────────────────────────────────

const MCInputSchema = z.object({
  topic: z.string().min(1),
  difficulty: DifficultySchema,
  count: z.number().int().min(1).max(20).optional().default(1),
});

generateRoutes.post("/multiple-choice", async (c) => {
  try {
    const body = await c.req.json();
    const input = MCInputSchema.safeParse(body);
    if (!input.success) {
      throw new AppError("VALIDATION_ERROR", input.error.message);
    }
    const { topic, difficulty, count } = input.data;
    const prompt = buildMultipleChoicePrompt({ topic, difficulty });

    const questions = await Promise.all(
      Array.from({ length: count }, () => callClaude(prompt, MultipleChoiceSchema)),
    );

    return c.json({ questions });
  } catch (error) {
    return handleError(c, error);
  }
});

// ─── POST /generate/open-ended ────────────────────────────────────────────────

const OEInputSchema = z.object({
  topic: z.string().min(1),
  difficulty: DifficultySchema,
  count: z.number().int().min(1).max(20).optional().default(1),
});

generateRoutes.post("/open-ended", async (c) => {
  try {
    const body = await c.req.json();
    const input = OEInputSchema.safeParse(body);
    if (!input.success) {
      throw new AppError("VALIDATION_ERROR", input.error.message);
    }
    const { topic, difficulty, count } = input.data;
    const prompt = buildOpenEndedGeneratePrompt({ topic, difficulty });

    const questions = await Promise.all(
      Array.from({ length: count }, () => callClaude(prompt, OpenEndedSchema)),
    );

    return c.json({ questions });
  } catch (error) {
    return handleError(c, error);
  }
});

// ─── POST /generate/deck ─────────────────────────────────────────────────────

const DeckInputSchema = z.object({
  topic: z.string().min(1),
  card_count: z.number().int().min(1).max(50),
  difficulty: DifficultySchema,
  language: z.string().min(1).optional().default("TypeScript"),
  user_id: z.string().min(1),
  deck_name: z.string().min(1).optional(),
});

generateRoutes.post("/deck", async (c) => {
  try {
    const body = await c.req.json();
    const input = DeckInputSchema.safeParse(body);
    if (!input.success) {
      throw new AppError("VALIDATION_ERROR", input.error.message);
    }
    const { topic, card_count, difficulty, language, user_id, deck_name } = input.data;

    // ~40% coding, ~30% MC, ~30% open-ended
    const codingCount = Math.round(card_count * 0.4);
    const mcCount = Math.round(card_count * 0.3);
    const oeCount = card_count - codingCount - mcCount;

    const [codingResults, mcResults, oeResults] = await Promise.all([
      Promise.all(
        Array.from({ length: codingCount }, () =>
          callClaude(buildCodingPrompt({ topic, difficulty, language }), CodingChallengeSchema),
        ),
      ),
      Promise.all(
        Array.from({ length: mcCount }, () =>
          callClaude(buildMultipleChoicePrompt({ topic, difficulty }), MultipleChoiceSchema),
        ),
      ),
      Promise.all(
        Array.from({ length: oeCount }, () =>
          callClaude(buildOpenEndedGeneratePrompt({ topic, difficulty }), OpenEndedSchema),
        ),
      ),
    ]);

    const deckId = crypto.randomUUID();
    const deckTitle = deck_name ?? `${topic} — ${difficulty}`;
    const now = new Date().toISOString();

    const cardRows = [
      ...codingResults.map((ch) => ({
        id: crypto.randomUUID(),
        deckId,
        cardType: "CODING" as const,
        title: ch.title,
        content: JSON.stringify(ch),
        createdAt: now,
        updatedAt: now,
        dueDate: now,
      })),
      ...mcResults.map((q) => ({
        id: crypto.randomUUID(),
        deckId,
        cardType: "MULTIPLE_CHOICE" as const,
        title: q.question.slice(0, 120),
        content: JSON.stringify(q),
        createdAt: now,
        updatedAt: now,
        dueDate: now,
      })),
      ...oeResults.map((q) => ({
        id: crypto.randomUUID(),
        deckId,
        cardType: "OPEN_ENDED" as const,
        title: q.question.slice(0, 120),
        content: JSON.stringify(q),
        createdAt: now,
        updatedAt: now,
        dueDate: now,
      })),
    ];

    await db.transaction(async (tx) => {
      await tx.insert(decks).values({
        id: deckId,
        userId: user_id,
        name: deckTitle,
        createdAt: now,
        updatedAt: now,
      });
      await tx.insert(cards).values(cardRows);
    });

    return c.json({
      deck_id: deckId,
      deck_name: deckTitle,
      card_count: cardRows.length,
      cards: cardRows.map(({ id, cardType, title }) => ({ id, cardType, title })),
    });
  } catch (error) {
    return handleError(c, error);
  }
});
