# Product Requirements Document (PRD)  
**Product Name:** CodeRecall CLI *(placeholder name)*  
**Version:** 1.0 (MVP)  
**Owner:** Jess Maya  
**Date:** 2025‑08‑02  

---

## 1. Vision & Purpose
**CodeRecall CLI** is an offline‑first coding challenge practice tool that lives in the terminal, letting developers train for interviews in their own editor (Neovim, VS Code, etc.) while tracking progress with a **spaced repetition algorithm (FSRS / SM‑2)**.

The tool supports:
- Local challenge storage in **Markdown** with strict metadata.
- Local progress tracking in **SQLite**.
- Optional sync with static‑file remote storage (GitHub repo, S3, etc.).
- Native desktop reminders to encourage daily practice.
- **Backup & restore capabilities**, including exporting everything as a `.zip` for easy migration.

---

## 2. Goals
### Primary Goals
1. Allow developers to practice and retain coding skills long‑term.
2. Support **fully offline usage** with all features.
3. Provide **strict, portable challenge format** to avoid duplicates and tampering.
4. Enable **simple cloud sync** without running a hosted backend.
5. Offer **one‑command backup & restore** to protect data.

### Secondary Goals
1. Offer reminders (desktop notifications, cron jobs).
2. Allow importing from community challenge libraries.
3. Detect duplicates and updated challenges automatically.

---

## 3. Target Users
### Primary Persona
**Name:** Jess, Experienced Frontend Developer  
**Goal:** Stay interview‑ready, remember problem‑solving patterns.  
**Pain Points:**
- Forgets solutions after a few days.
- Dislikes browser‑based practice tools.

### Secondary Persona
**Name:** Sam, Junior Developer  
**Goal:** Improve problem‑solving skills with structured practice.  
**Pain Points:**
- Needs guidance on which problems to review next.

---

## 4. Success Metrics
- **Retention:** User can solve 90% of challenges correctly 30+ days after first attempt.
- **Engagement:** User reviews challenges at least 3 days/week.
- **Portability:** A user can fully back up and restore all data from a `.zip` file or Git repo.

---

## 5. Key Features
### MVP Features (v1.0)
1. **Challenge Management**
   - Challenges stored as Markdown (`.md`) with strict YAML frontmatter.
   - Each challenge has a **content‑hash ID** (SHA‑256) for duplicate detection.
   - Local storage in `~/.coderecall/challenges/`.

2. **Spaced Repetition Scheduler**
   - Uses **FSRS / SM‑2 algorithm** for optimal review scheduling.
   - User rates review difficulty (`Again`, `Hard`, `Good`, `Easy`).

3. **Progress Tracking**
   - Stored in local SQLite DB at `~/.coderecall/data.db`.
   - Tracks ease factor, interval, repetitions, next due date.

4. **Review Mode**
   - CLI shows due challenges for today.
   - Opens in user’s configured editor (Neovim, VS Code, etc.).
   - Updates schedule after rating.

5. **Random Challenge Mode**
   - Select a mastered challenge at random.

6. **Sync Mode**
   - Push/pull challenges + `progress.json` to/from:
     - GitHub repo
     - S3 bucket
     - Any local/remote folder
   - Conflict detection via content hash + version number.

7. **Notifications**
   - Local OS notifications (via `notify-rust`).
   - User‑configurable daily reminder time.
   - Example: `coderecall remind`.

8. **Backup & Restore**
   - **Local Backup:**
     ```bash
     coderecall backup --to ./backup-YYYY-MM-DD.db
     ```
     Creates a consistent copy of the SQLite DB using `VACUUM INTO`.
   - **Local Restore:**
     ```bash
     coderecall restore --from ./backup-YYYY-MM-DD.db
     ```
     Replaces current DB with backup (confirmation prompt).
   - **Full Export to ZIP:**
     ```bash
     coderecall export --to ./coderecall-full-backup.zip
     ```
     Includes:
       - `data.db` (SQLite database)
       - All `.md` challenge files
       - `config.toml` (user settings)
   - **Full Import from ZIP:**
     ```bash
     coderecall import --from ./coderecall-full-backup.zip
     ```
     Restores database, challenges, and config in one step.
   - **Cloud Backup Option:**
     - Upload backup `.zip` or `data.db` to:
       - GitHub repo
       - S3 bucket
       - Any file‑hosting service
     - Restore by downloading and using `coderecall restore` or `coderecall import`.

---

## 6. Constraints & Assumptions
- **Offline‑first** — works fully offline, cloud sync is optional.
- **No arbitrary file uploads** — only `.md` challenges and validated SQLite backups.
- **Static file sync** — no database server required.
- **Cross‑platform** — Linux, macOS, Windows.

---

## 7. Challenge Format
Example Markdown challenge file:
\`\`\`yaml
---
id: sha256:2b6f75c5d5d3e7c2d4a2786f3d987afefb6d3a15a041e88f8b6bcd0427e0a5f9
title: Debounce Function
author: Jess Maya
source: github.com/jessmaya/coderecall-challenges
tags: [javascript, frontend, event-handling]
pattern: debounce
created_at: 2025-08-02
version: 1
---
## Problem
Implement a debounce function.

## Examples
debounce(fn, 300) → delays execution.

## Notes
Common in search bars, resize events.
\`\`\`

---

## 8. CLI Commands
\`\`\`bash
coderecall review               # Practice due challenges
coderecall stats                # View streak, mastery rate, due count
coderecall add <file.md>        # Add a new challenge
coderecall random               # Random mastered challenge
coderecall sync --to github     # Push challenges + progress.json
coderecall sync --from github   # Pull from repo
coderecall remind               # Show OS notification for due challenges
coderecall import <url>         # Import from GitHub repo or ZIP
coderecall backup --to <file>   # Backup SQLite DB
coderecall restore --from <file> # Restore SQLite DB
coderecall export --to <file>   # Export DB + challenges as ZIP
coderecall import --from <file> # Import from ZIP
\`\`\`

---

## 9. Sync Workflow
### Push
1. Export progress from SQLite → `progress.json`.
2. Compare challenge hashes with remote index.
3. Push new/updated challenges + `progress.json`.

### Pull
1. Download remote challenges + `progress.json`.
2. Merge into local DB (update only newer content).

---

## 10. Notifications Workflow
1. User sets reminder time in config:
\`\`\`toml
reminder_time = "09:00"
\`\`\`
2. CLI command `coderecall remind` checks if any challenges are due today.
3. If yes → shows native notification.
4. Can be scheduled via cron/Task Scheduler.

---

## 11. Roadmap & Milestones
### Sprint 1 (Weeks 1–2)
- CLI scaffolding (Rust + Clap).
- SQLite schema.
- Markdown parsing + challenge import.

### Sprint 2 (Weeks 3–4)
- FSRS / SM‑2 scheduling.
- Review mode.
- Stats dashboard.

### Sprint 3 (Weeks 5–6)
- Sync with GitHub/S3.
- Notifications.
- Backup & restore commands.
- Full export/import to ZIP.

---

## 12. Risks
- **FSRS complexity** — must be tested for accuracy.
- **Sync conflicts** — need clear rules for merges.
- **Cross‑platform notifications** — must work on all OSs.

---

## 13. Deliverables
- Fully working CLI tool with offline and sync modes.
- Markdown challenge library.
- Example GitHub backup repo.
- Documentation for setup, usage, sync, and backup.
