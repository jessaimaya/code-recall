import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-4-6" as const;

// Lazy singleton — key validation happens at startup in index.ts
export const anthropic = new Anthropic();
