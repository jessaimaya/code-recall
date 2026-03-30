import { createClient as createLibSQLClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type DrizzleClient = ReturnType<typeof createDb>;

/**
 * Create a Drizzle ORM client backed by libSQL (works with both local SQLite
 * file URLs and Turso cloud URLs).
 *
 * @example Local dev
 *   createDb("file:local.db")
 *
 * @example Turso cloud
 *   createDb(process.env.TURSO_DATABASE_URL, process.env.TURSO_AUTH_TOKEN)
 */
export function createDb(url: string, authToken?: string) {
  const client = createLibSQLClient({ url, authToken });
  return drizzle(client, { schema });
}
