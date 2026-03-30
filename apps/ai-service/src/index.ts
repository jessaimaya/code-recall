import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generateRoutes } from "./routes/generate";
import { evaluateRoutes } from "./routes/evaluate";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is required");
  process.exit(1);
}

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));
app.route("/generate", generateRoutes);
app.route("/evaluate", evaluateRoutes);

// Consistent error shape for unhandled routes
app.notFound((c) => c.json({ error: "Not found", code: "NOT_FOUND" }, 404));

const port = parseInt(process.env.PORT ?? "3001", 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`AI service listening on port ${port}`);
});
