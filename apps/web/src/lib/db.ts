import { createDb } from "@repo/db";

const url = import.meta.env.VITE_TURSO_DATABASE_URL as string;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN as string | undefined;

if (!url) {
  throw new Error("VITE_TURSO_DATABASE_URL is not set");
}

export const db = createDb(url, authToken);
