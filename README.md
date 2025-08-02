# 📚 CodeRecall CLI

**An offline‑first, AI‑ready coding challenge trainer in your terminal.**  
Practice, retain, and master coding interview skills using **spaced repetition (FSRS / SM‑2)**, all without leaving your favorite code editor.

---

## ✨ Features

- 🖥 **Terminal‑based** — stay in your own environment (Neovim, VS Code, etc.).
- 🧠 **Spaced repetition learning** — proven FSRS / SM‑2 algorithm to maximize retention.
- 📄 **Markdown challenges** — portable, version‑controlled, human‑readable.
- 📊 **Progress tracking** — mastery rate, streaks, due challenges.
- 🔔 **Reminders** — native desktop notifications to keep you on track.
- ☁ **Sync support** — backup to GitHub, S3, or any static file host.
- 📦 **Backup & restore** — export your entire setup to a `.zip` and restore anywhere.

---

## 📂 Project Goals

This project is part of my **public portfolio** to demonstrate:
- **Rust CLI development**
- **Algorithm implementation** (FSRS / SM‑2)
- **File‑based data management**
- **Cross‑platform notification integration**
- **Developer‑first UX**
- **Open‑source project planning** with a full [PRD](./PRD.md)

The design ensures it works **offline‑first**, but can easily **sync across devices** using static file hosting — no complex cloud backend required.

---

## 🚀 Quick Start

### 1️⃣ Install
```bash
# Clone this repository
git clone https://github.com/YOUR_USERNAME/coderecall-cli.git
cd coderecall-cli

# Build and install (requires Rust)
cargo install --path .
```

### 2️⃣ Add Your First Challenge
```bash
coderecall add ./examples/debounce.md
```

### 3️⃣ Review Challenges
```bash
coderecall review
```

### 4️⃣ See Your Progress
```bash
coderecall stats
```

---

## 🗂 Folder Structure

```
~/.coderecall/
 ├─ challenges/      # Markdown challenge files
 ├─ data.db          # SQLite database
 ├─ backups/         # Optional database backups
 └─ config.toml      # User settings
```

---

## 📦 Backup & Restore

**Local backup:**
```bash
coderecall backup --to ./backup-2025-08-02.db
```

**Full export to `.zip`:**
```bash
coderecall export --to ./coderecall-full-backup.zip
```

**Restore from `.zip`:**
```bash
coderecall import --from ./coderecall-full-backup.zip
```

---

## 🔔 Reminders

Set a daily reminder time in your config:
```toml
reminder_time = "09:00"
```
Schedule reminders with `cron` (macOS/Linux) or Task Scheduler (Windows):
```bash
0 9 * * * coderecall remind
```

---

## 🌍 Sync Options

You can push/pull your challenges & progress to:
- **GitHub repo** (private or public)
- **S3 bucket**
- Any static file hosting service

Example:
```bash
coderecall sync --to github
coderecall sync --from github
```

---

## 🛠 Tech Stack

- **Language:** Rust
- **Database:** SQLite
- **Data Format:** Markdown (challenges), JSON (progress export)
- **Algorithm:** FSRS / SM‑2 spaced repetition
- **Notifications:** `notify-rust` (Linux/macOS), `winrt-notification` (Windows)
- **Packaging:** Cross‑platform binary via Cargo

---

## 🧩 Example Challenge Format

```yaml
---
id: sha256:2b6f75c5...
title: Debounce Function
author: Jess Maya
tags: [javascript, frontend]
pattern: debounce
created_at: 2025-08-02
version: 1
---
## Problem
Implement a debounce function.

## Examples
debounce(fn, 300) → delays execution.
```

---

## 📌 Roadmap

- [x] PRD defined ([see here](./PRD.md))
- [ ] Implement CLI scaffolding
- [ ] Implement SQLite schema
- [ ] Markdown parsing & challenge import
- [ ] FSRS / SM‑2 scheduler
- [ ] Review mode & stats
- [ ] Notifications
- [ ] Backup & restore commands
- [ ] Full export/import
- [ ] Sync with GitHub/S3

---

## 🤝 Contributing

This is an **open portfolio project** — contributions, feedback, and suggestions are welcome.

1. Fork this repo
2. Create a feature branch
3. Submit a PR

---

## 📜 License

MIT — Free to use, modify, and share.

---

**💡 Created as part of my public developer portfolio to showcase product thinking, full‑stack development, and Rust CLI expertise.**
