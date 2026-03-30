import type { NextConfig } from "next";
import { z } from "zod";

// Validate required environment variables at startup
const envSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  TURSO_DATABASE_URL: z.string().min(1),
  TURSO_AUTH_TOKEN: z.string().optional(),
  AI_SERVICE_URL: z.string().url().optional().default("http://localhost:3001"),
});

// Only validate at build/start time, not during `next lint` or type-check
if (
  process.env.NEXT_PHASE !== "phase-development-server" ||
  process.env.SKIP_ENV_VALIDATION !== "1"
) {
  try {
    envSchema.parse(process.env);
  } catch {
    // Log warning but don't crash — keys may not be present in CI
    console.warn("[next.config] Missing or invalid env vars — check .env.local");
  }
}

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/db", "@repo/core", "@repo/ui"],
};

export default nextConfig;
