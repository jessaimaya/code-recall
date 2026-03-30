import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client";
import path from "path";

const MIGRATIONS_FOLDER = path.join(__dirname, "../migrations");

export async function runMigrations(url: string, authToken?: string): Promise<void> {
  const client = createClient({ url, authToken });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  client.close();
}
