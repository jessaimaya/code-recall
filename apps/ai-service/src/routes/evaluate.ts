import { Hono } from "hono";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL } from "../lib/anthropic";
import { AppError, handleError } from "../lib/errors";
import { buildOpenEndedEvalPrompt } from "../prompts/open-ended-v1";

export const evaluateRoutes = new Hono();

// ─── Output schema ────────────────────────────────────────────────────────────

const OpenEndedEvalSchema = z.object({
  score: z
    .number()
    .int()
    .describe("1=Again, 2=Hard, 3=Good, 4=Easy — maps directly to FSRS ratings"),
  feedback: z.string().describe("Constructive, specific feedback under 100 words"),
  missing_concepts: z
    .array(z.string())
    .describe("Short phrases for absent or underdeveloped concepts"),
  suggested_rating: z.number().int().describe("FSRS rating 1–4, same value as score"),
});

// ─── POST /evaluate/open-ended ────────────────────────────────────────────────

const OEEvalInputSchema = z.object({
  question: z.string().min(1),
  user_answer: z.string().min(1),
  model_answer: z.string().optional(),
});

evaluateRoutes.post("/open-ended", async (c) => {
  try {
    const body = await c.req.json();
    const input = OEEvalInputSchema.safeParse(body);
    if (!input.success) {
      throw new AppError("VALIDATION_ERROR", input.error.message);
    }
    const { question, user_answer, model_answer } = input.data;

    const prompt = buildOpenEndedEvalPrompt({
      question,
      userAnswer: user_answer,
      modelAnswer: model_answer,
    });

    const response = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
      output_config: { format: zodOutputFormat(OpenEndedEvalSchema) },
    });

    if (!response.parsed_output) {
      throw new AppError("EVALUATION_FAILED", "Failed to parse evaluation response", 500);
    }

    const result = response.parsed_output;

    // Clamp score to valid FSRS range (1–4) in case Claude drifts
    const score = Math.max(1, Math.min(4, result.score)) as 1 | 2 | 3 | 4;

    return c.json({
      score,
      feedback: result.feedback,
      missing_concepts: result.missing_concepts,
      suggested_rating: score,
    });
  } catch (error) {
    return handleError(c, error);
  }
});
