import type { Context } from "hono";

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(c: Context, error: unknown) {
  if (error instanceof AppError) {
    return c.json({ error: error.message, code: error.code }, error.status as 400 | 422 | 500);
  }
  console.error("Unexpected error:", error);
  return c.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, 500);
}
