# Contributing to CodeRecall CLI

Thank you for considering contributing to **CodeRecall CLI**!  
This document describes the contribution process, branching workflow, and coding guidelines for the project.

---

## 📌 How to Contribute

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally.
3. **Create a new branch** from `develop` for your changes.
4. Make your changes and **commit** them following the commit guidelines.
5. **Push** your branch to your fork.
6. **Open a Pull Request (PR)** targeting the `develop` branch.

---

## 🌳 Branching Strategy (Git Flow)

We follow the **Git Flow** model for this project.

- **main** → Always stable, production-ready.  
  Contains only released versions.

- **develop** → Integration branch for upcoming releases.  
  All features and fixes merge here before going to `main`.

- **feature/** → For new features.  
  Based on `develop`. Merged back into `develop` when complete.

- **bugfix/** → For non‑urgent fixes during development.  
  Based on `develop`.

- **hotfix/** → For urgent fixes to `main`.  
  Based on `main`, merged into both `main` and `develop` after release.

- **release/** → Pre‑release stabilization branch.  
  Based on `develop`, merged into both `main` and `develop`.

### Branch Naming Examples
```
feature/markdown-import
feature/fsrs-scheduling
bugfix/sqlite-restore
hotfix/notification-crash
release/1.0.0
```

---

## 📝 Commit Message Guidelines

Use **clear, descriptive commit messages**.

**Format:**
```
type(scope): short description
```

**Types:**
- `feat` → New feature
- `fix` → Bug fix
- `docs` → Documentation changes
- `style` → Formatting changes (no code logic change)
- `refactor` → Code restructure without changing behavior
- `test` → Adding or modifying tests
- `chore` → Build, tooling, dependency updates

**Examples:**
```
feat(review): add FSRS scheduling algorithm
fix(import): handle missing YAML frontmatter
docs(readme): update installation instructions
```

---

## 🔄 Pull Request Process

- **Link to an Issue** — Include `Closes #issue_number` in the PR description.
- **Target branch** — All PRs should target `develop`, not `main`.
- **Tests** — All tests must pass before merge.
- **Review** — At least one reviewer must approve (you can self-review for now).

---

## 🎨 Code Style

- Follow Rust formatting standards.
- Before committing, run:
```bash
cargo fmt
cargo clippy
```

---

## ✅ Testing

- Add tests for all new features and bug fixes.
- Run all tests before pushing:
```bash
cargo test
```

---

## 📊 Git Flow Diagram

```
main  --------------------●-----------------●--------- stable releases
                           \               //
develop --------------------●-------------●----------- ongoing development
                              \           //
feature/...                    ●---------●------------ feature branches
```

---

By following these guidelines, you help keep the project maintainable, consistent, and professional.
