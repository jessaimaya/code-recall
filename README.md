# code-recall

> Spaced repetition for developers. Practice coding interviews the way you actually work.

**code-recall** is a local-first study tool built around the [FSRS](https://github.com/open-spaced-repetition/fsrs4anki) algorithm. It surfaces coding challenges, multiple choice questions, and concept prompts at the right moment — so you retain what you learn instead of cramming and forgetting.

## How it works

A background daemon tracks your review schedule and fires OS notifications when cards are due. The CLI scaffolds each challenge into your local filesystem — open the files in your editor, write your solution, and run the tests. Pass them, rate your confidence, done.

```bash
code-recall start          # see what's due today
code-recall next           # scaffold the next challenge
code-recall test           # run tests against your solution
code-recall submit         # record result and advance schedule
```

For reviewing on other devices, a companion web app covers multiple choice and concept cards (no code execution).

## Stack

| Layer | Technology |
|---|---|
| CLI + daemon | Rust · clap · ratatui · notify-rust |
| Web | Next.js 15 · TypeScript · Tailwind · tRPC |
| Database | SQLite (local) · Turso/libSQL (cloud sync) |
| ORM | Drizzle ORM |
| Scheduling | FSRS (ts-fsrs + rs-fsrs) |
| AI | Anthropic Claude — question generation & evaluation |
| Monorepo | Turborepo · pnpm workspaces |

## Project status

Early development. Tracking progress on the [GitHub Project board](../../projects).

| Epic | Status |
|---|---|
| E01 Foundation & Monorepo | 🚧 In progress |
| E02 Database & ORM | 📋 Planned |
| E03 FSRS Algorithm | 📋 Planned |
| E04 AI Service | 📋 Planned |
| E05–06 Web App | 📋 Planned |
| E07 CLI Core | 📋 Planned |
| E08 Daemon & Notifications | 📋 Planned |
| E09 Distribution | 📋 Planned |

## Local setup

```bash
# Prerequisites: Node 20+, pnpm, Rust stable, Docker

git clone https://github.com/jessaimaya/code-recall.git
cd code-recall

pnpm install
cp .env.example .env       # fill in your keys

docker compose up -d       # start local services
pnpm dev                   # start web + ai-service
```

For the CLI:

```bash
cd apps/cli
cargo build
./target/debug/code-recall init
```

Full setup docs in [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md).

## License

MIT
