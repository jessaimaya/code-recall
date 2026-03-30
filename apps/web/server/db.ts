import { createDb } from "@repo/db";

const url = process.env.TURSO_DATABASE_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createDb(url, authToken);
