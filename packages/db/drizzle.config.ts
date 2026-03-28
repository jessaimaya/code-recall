import type { Config } from "drizzle-kit";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

export default {
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: tursoUrl ? { url: tursoUrl, authToken: tursoToken } : { url: "file:local.db" },
} satisfies Config;
