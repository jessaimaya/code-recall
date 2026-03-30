FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

# ── Dependencies ─────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
# Copy workspace manifests needed to resolve @repo/* packages
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
COPY packages/config/package.json ./packages/config/
COPY apps/ai-service/package.json ./apps/ai-service/
RUN pnpm install --frozen-lockfile

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/ai-service/node_modules ./apps/ai-service/node_modules
COPY apps/ai-service ./apps/ai-service

WORKDIR /app/apps/ai-service
EXPOSE 3001
CMD ["node", "src/index.js"]
