import { existsSync, unlinkSync } from "fs";
import { runMigrations } from "../src/migrate";

const url = process.env.DATABASE_URL ?? "file:local.db";

if (url.startsWith("file:")) {
  const filePath = url.replace("file:", "");
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    console.log(`Dropped ${filePath}`);
  }
}

await runMigrations(url);
console.log("Database recreated from migrations.");
