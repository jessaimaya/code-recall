# CodeRecall CLI Architecture Design

**Version:** 1.0  
**Date:** 2025-08-03  
**Author:** Claude (Senior Rust CLI Architect)

---

## Overview

CodeRecall CLI is an **offline-first**, file-based coding challenge trainer using **spaced repetition (FSRS/SM-2)** to help developers retain coding interview solutions long-term. This document outlines the complete architecture for a robust, cross-platform Rust CLI application.

---

## 1. CLI Command Structure

```rust
// Main CLI structure using clap
coderecall <COMMAND> [OPTIONS]

Commands:
  review [--editor <EDITOR>] [--count <N>]     # Review due challenges
  add <FILE>... [--verify]                     # Add challenge(s) from file(s)
  import <SOURCE> [--type <github|zip|dir>]    # Import from various sources
  
  stats [--format <table|json>]                # Show progress statistics
  list [--due] [--tag <TAG>] [--pattern <PATTERN>]  # List challenges
  random [--mastered-only]                     # Open random challenge
  
  sync <DIRECTION> <TARGET>                    # sync --to|--from github|s3|path
  backup --to <FILE>                           # Backup database only
  restore --from <FILE>                        # Restore database only
  export --to <FILE>                           # Export everything to ZIP
  import --from <FILE>                         # Import everything from ZIP
  
  remind [--notify]                            # Check/send reminders
  config [--editor <EDITOR>] [--data-dir <DIR>] # Configure settings

Global Options:
  --data-dir <DIR>    # Override default ~/.coderecall
  --config <FILE>     # Override config file location
  --quiet            # Suppress non-essential output
```

---

## 2. SQLite Schema Design

```sql
-- Core schema optimized for FSRS algorithm and efficient queries
PRAGMA foreign_keys = ON;

-- Challenges table (metadata only, content stays in .md files)
CREATE TABLE challenges (
    id TEXT PRIMARY KEY,              -- sha256 hash of content
    title TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,   -- relative to challenges dir
    author TEXT,
    source TEXT,                      -- origin URL/repo
    tags TEXT,                        -- JSON array: ["javascript", "algorithms"]
    pattern TEXT,                     -- problem pattern/category
    created_at INTEGER NOT NULL,      -- unix timestamp
    version INTEGER NOT NULL DEFAULT 1,
    last_modified INTEGER NOT NULL,   -- file mtime for sync
    content_hash TEXT NOT NULL,       -- for duplicate detection
    UNIQUE(content_hash, version)
);

-- FSRS-based progress tracking
CREATE TABLE progress (
    challenge_id TEXT NOT NULL,
    user_id TEXT DEFAULT 'default',   -- for future multi-user support
    
    -- FSRS core parameters
    stability REAL NOT NULL DEFAULT 1.0,
    difficulty REAL NOT NULL DEFAULT 5.0,
    
    -- SM-2 compatibility fields
    ease_factor REAL NOT NULL DEFAULT 2.5,
    interval_days INTEGER NOT NULL DEFAULT 1,
    repetitions INTEGER NOT NULL DEFAULT 0,
    
    -- Scheduling
    due_date INTEGER NOT NULL,        -- unix timestamp
    last_reviewed INTEGER,            -- unix timestamp
    review_count INTEGER NOT NULL DEFAULT 0,
    
    -- Performance tracking
    correct_streak INTEGER NOT NULL DEFAULT 0,
    total_attempts INTEGER NOT NULL DEFAULT 0,
    average_rating REAL DEFAULT NULL, -- 1-4 scale (Again/Hard/Good/Easy)
    
    -- Metadata
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    
    PRIMARY KEY (challenge_id, user_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
);

-- Review history for analytics and FSRS tuning
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id TEXT NOT NULL,
    user_id TEXT DEFAULT 'default',
    rating INTEGER NOT NULL,          -- 1=Again, 2=Hard, 3=Good, 4=Easy
    response_time_ms INTEGER,         -- time spent in editor
    review_date INTEGER NOT NULL,     -- unix timestamp
    previous_interval INTEGER,        -- for FSRS analysis
    
    FOREIGN KEY (challenge_id, user_id) REFERENCES progress(challenge_id, user_id)
);

-- Sync state tracking
CREATE TABLE sync_state (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- singleton table
    last_sync_timestamp INTEGER,
    last_sync_target TEXT,            -- "github", "s3", etc.
    local_sequence INTEGER NOT NULL DEFAULT 0, -- incremented on changes
    remote_sequence INTEGER DEFAULT 0, -- from last sync
    conflict_count INTEGER NOT NULL DEFAULT 0
);

-- Configuration storage
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_progress_due ON progress(due_date, user_id) WHERE due_date <= strftime('%s', 'now');
CREATE INDEX idx_challenges_tags ON challenges(tags); -- for tag-based filtering
CREATE INDEX idx_reviews_date ON reviews(review_date);
CREATE INDEX idx_challenges_pattern ON challenges(pattern);
```

---

## 3. Module Structure & Data Flow

### Directory Structure
```
src/
├── main.rs                    # CLI entry point
├── cli/
│   ├── mod.rs                # CLI command definitions
│   ├── commands/
│   │   ├── mod.rs
│   │   ├── review.rs         # Review command logic
│   │   ├── add.rs            # Add challenges
│   │   ├── sync.rs           # Sync operations
│   │   ├── backup.rs         # Backup/restore/export/import
│   │   ├── stats.rs          # Statistics and analytics
│   │   └── config.rs         # Configuration management
│   └── args.rs               # Argument parsing structs
├── core/
│   ├── mod.rs
│   ├── challenge.rs          # Challenge struct and parsing
│   ├── progress.rs           # Progress tracking logic
│   ├── scheduler.rs          # FSRS/SM-2 implementation
│   └── database.rs           # SQLite operations
├── storage/
│   ├── mod.rs
│   ├── filesystem.rs         # Local file operations
│   ├── sync/
│   │   ├── mod.rs
│   │   ├── github.rs         # GitHub sync provider
│   │   ├── s3.rs             # S3 sync provider
│   │   └── traits.rs         # Sync provider traits
│   └── backup.rs             # Backup/export logic
├── notifications/
│   ├── mod.rs
│   └── native.rs             # Cross-platform notifications
├── utils/
│   ├── mod.rs
│   ├── crypto.rs             # Hashing utilities
│   ├── time.rs               # Time/date utilities
│   └── editor.rs             # Editor detection/launching
├── config/
│   ├── mod.rs
│   └── settings.rs           # Configuration management
└── errors.rs                 # Error types and handling
```

### Data Flow Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Commands  │───▶│   Core Logic    │───▶│   Storage       │
│                 │    │                 │    │                 │
│ • review        │    │ • Challenge     │    │ • SQLite DB     │
│ • add           │    │ • Progress      │    │ • Markdown      │
│ • sync          │    │ • Scheduler     │    │ • Filesystem    │
│ • backup        │    │ • Database      │    │ • Sync Providers│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────▶│   Utilities     │◀─────────────┘
                        │                 │
                        │ • Editor Launch │
                        │ • Notifications │
                        │ • Crypto/Hash   │
                        │ • Time Utils    │
                        └─────────────────┘
```

---

## 4. Recommended Rust Crates

```toml
[dependencies]
# CLI & Argument Parsing
clap = { version = "4.4", features = ["derive", "env"] }
clap_complete = "4.4"        # Shell completion generation

# Database
rusqlite = { version = "0.30", features = ["bundled", "chrono", "serde_json"] }
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "sqlite", "chrono", "json"], optional = true }

# Serialization & Parsing
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
serde_yaml = "0.9"           # For YAML frontmatter
toml = "0.8"                 # For config files

# Markdown Processing
pulldown-cmark = "0.9"       # Fast CommonMark parser
pulldown-cmark-to-cmark = "11.0" # For markdown manipulation
yaml-front-matter = "0.1"   # Extract YAML frontmatter

# File & Archive Operations
walkdir = "2.4"              # Recursive directory traversal
zip = "0.6"                  # ZIP archive creation/extraction
tempfile = "3.8"             # Temporary file handling

# Async Runtime (for sync operations)
tokio = { version = "1.35", features = ["rt-multi-thread", "macros", "fs", "process"] }
reqwest = { version = "0.11", features = ["json", "stream"] }

# Time & Scheduling
chrono = { version = "0.4", features = ["serde"] }
cron = "0.12"                # For cron expression parsing

# Cryptography & Hashing
sha2 = "0.10"                # SHA-256 hashing
blake3 = "1.5"               # Fast hashing (alternative)

# Cross-platform Operations
dirs = "5.0"                 # Standard directory locations
notify-rust = "4.10"         # Desktop notifications
open = "5.0"                 # Open files with default programs

# Error Handling
thiserror = "1.0"            # Error type derivation
anyhow = "1.0"               # Error context and chaining

# Logging
tracing = "0.1"              # Structured logging
tracing-subscriber = { version = "0.3", features = ["env-filter"] }

# Configuration
config = "0.13"              # Configuration management
envy = "0.4"                 # Environment variable parsing

# GitHub Integration
octocrab = "0.32"            # GitHub API client
git2 = "0.18"                # Git operations

# S3 Integration (optional)
aws-sdk-s3 = { version = "0.39", optional = true }
aws-config = { version = "0.56", optional = true }

# Progress & User Interface
indicatif = "0.17"           # Progress bars
console = "0.15"             # Terminal utilities
dialoguer = "0.11"           # Interactive prompts

[dev-dependencies]
tempfile = "3.8"             # For tests requiring temporary files
pretty_assertions = "1.4"    # Better assertion output
serial_test = "3.0"          # Serialize tests that touch filesystem

[features]
default = ["github-sync"]
github-sync = ["octocrab", "git2"]
s3-sync = ["aws-sdk-s3", "aws-config"]
sqlx-backend = ["sqlx"]      # Alternative to rusqlite
```

---

## 5. Sync Mechanism & Conflict Resolution

### Sync Architecture
```rust
pub trait SyncProvider {
    async fn push_challenges(&self, challenges: &[Challenge]) -> Result<()>;
    async fn pull_challenges(&self) -> Result<Vec<Challenge>>;
    async fn push_progress(&self, progress: &ProgressExport) -> Result<()>;
    async fn pull_progress(&self) -> Result<Option<ProgressExport>>;
    async fn get_remote_manifest(&self) -> Result<SyncManifest>;
}

// Sync manifest tracks state
#[derive(Serialize, Deserialize)]
pub struct SyncManifest {
    pub sequence: u64,
    pub last_sync: chrono::DateTime<chrono::Utc>,
    pub challenge_hashes: HashMap<String, u64>, // id -> version
    pub progress_hash: String,
}
```

### Conflict Resolution Strategy

1. **Challenge Conflicts:**
   - Same content hash = no conflict
   - Different content, same title = create new challenge with suffix
   - Version mismatch = keep highest version number

2. **Progress Conflicts:**
   - Last-write-wins for individual challenge progress
   - Merge review histories by timestamp
   - Preserve local streaks if remote data is older

3. **Sync Workflow:**
```
┌─────────────────┐
│  Check Remote   │
│   Manifest      │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    Yes   ┌─────────────────┐
│ Local Changes?  │─────────▶│  Push Changes   │
└─────────┬───────┘          └─────────────────┘
          │ No
          ▼
┌─────────────────┐    Yes   ┌─────────────────┐
│Remote Changes?  │─────────▶│  Pull Changes   │
└─────────┬───────┘          └─────────┬───────┘
          │ No                         │
          ▼                            ▼
┌─────────────────┐          ┌─────────────────┐
│   Up to Date    │          │ Resolve Conflicts│
└─────────────────┘          └─────────────────┘
```

---

## 6. Testing Strategy & Cross-Platform Considerations

### Testing Architecture
```rust
// Integration tests structure
tests/
├── integration/
│   ├── cli_tests.rs          # End-to-end CLI testing
│   ├── sync_tests.rs         # Sync provider testing
│   ├── backup_tests.rs       # Backup/restore workflows
│   └── scheduler_tests.rs    # FSRS algorithm validation
├── fixtures/
│   ├── challenges/           # Sample challenge files
│   ├── configs/              # Test configurations
│   └── databases/            # SQLite test fixtures
└── common/
    └── test_helpers.rs       # Shared test utilities

// Unit test strategy
#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    use serial_test::serial;    // For filesystem tests
    
    // Test database operations in isolation
    #[tokio::test] 
    async fn test_challenge_crud() { /* ... */ }
    
    // Test FSRS calculations
    #[test]
    fn test_fsrs_scheduling() { /* ... */ }
}
```

### Cross-Platform Considerations

1. **File Paths:**
   - Use `std::path::PathBuf` everywhere
   - Handle case-insensitive filesystems (macOS)
   - Respect platform-specific directory conventions via `dirs` crate

2. **Notifications:**
   ```rust
   #[cfg(target_os = "windows")]
   use winrt_notification::Toast;
   
   #[cfg(any(target_os = "linux", target_os = "macos"))]
   use notify_rust::Notification;
   ```

3. **Editor Detection:**
   ```rust
   fn detect_editor() -> Option<String> {
       std::env::var("VISUAL")
           .or_else(|_| std::env::var("EDITOR"))
           .or_else(|_| platform_default_editor())
           .ok()
   }
   
   #[cfg(windows)]
   fn platform_default_editor() -> Result<String, ()> {
       Ok("notepad.exe".to_string())
   }
   
   #[cfg(unix)]
   fn platform_default_editor() -> Result<String, ()> {
       Ok("nano".to_string())
   }
   ```

4. **Potential Pitfalls & Solutions:**
   - **SQLite locking:** Use WAL mode, connection pooling
   - **File permissions:** Check write access before operations
   - **Time zones:** Store all timestamps as UTC
   - **Path separators:** Use `Path::join()` instead of string concatenation
   - **Case sensitivity:** Normalize file names for deduplication
   - **Process spawning:** Use `tokio::process` for async editor launching

---

## 7. Key Data Structures

### Challenge Structure
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Challenge {
    pub id: String,              // SHA-256 hash
    pub title: String,
    pub file_path: PathBuf,
    pub author: Option<String>,
    pub source: Option<String>,
    pub tags: Vec<String>,
    pub pattern: Option<String>,
    pub created_at: DateTime<Utc>,
    pub version: u32,
    pub last_modified: DateTime<Utc>,
    pub content_hash: String,
    pub content: String,         // Markdown content
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChallengeFrontmatter {
    pub id: String,
    pub title: String,
    pub author: Option<String>,
    pub source: Option<String>,
    pub tags: Vec<String>,
    pub pattern: Option<String>,
    pub created_at: String,
    pub version: u32,
}
```

### Progress Tracking
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Progress {
    pub challenge_id: String,
    pub user_id: String,
    
    // FSRS parameters
    pub stability: f64,
    pub difficulty: f64,
    
    // SM-2 compatibility
    pub ease_factor: f64,
    pub interval_days: i32,
    pub repetitions: i32,
    
    // Scheduling
    pub due_date: DateTime<Utc>,
    pub last_reviewed: Option<DateTime<Utc>>,
    pub review_count: i32,
    
    // Performance
    pub correct_streak: i32,
    pub total_attempts: i32,
    pub average_rating: Option<f64>,
    
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReviewRecord {
    pub challenge_id: String,
    pub user_id: String,
    pub rating: ReviewRating,     // Again, Hard, Good, Easy
    pub response_time_ms: Option<u64>,
    pub review_date: DateTime<Utc>,
    pub previous_interval: i32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum ReviewRating {
    Again = 1,
    Hard = 2,
    Good = 3,
    Easy = 4,
}
```

---

## 8. Configuration Management

### Config File Structure (`~/.coderecall/config.toml`)
```toml
[general]
data_dir = "~/.coderecall"
editor = "code"              # Override auto-detection
default_tags = ["practice"]

[reminders]
enabled = true
time = "09:00"              # Daily reminder time
timezone = "UTC"

[sync]
default_provider = "github"
auto_sync = false

[sync.github]
username = "your-username"
repo = "coderecall-data"
token_env = "GITHUB_TOKEN"  # Environment variable name
branch = "main"

[sync.s3]
bucket = "my-coderecall-backup"
region = "us-east-1"
prefix = "challenges/"

[fsrs]
# FSRS algorithm parameters (advanced)
request_retention = 0.9
maximum_interval = 36500    # ~100 years in days
```

---

## 9. Implementation Roadmap

### Phase 1: Core Foundation (Weeks 1-2)
- [ ] CLI scaffolding with clap
- [ ] SQLite schema setup and migrations
- [ ] Challenge parsing (Markdown + YAML frontmatter)
- [ ] Basic database operations (CRUD)

### Phase 2: Spaced Repetition (Weeks 3-4)
- [ ] FSRS/SM-2 algorithm implementation
- [ ] Review scheduling logic
- [ ] Progress tracking and statistics
- [ ] Review command with editor integration

### Phase 3: Data Management (Weeks 5-6)
- [ ] Backup and restore commands
- [ ] Export/import to ZIP
- [ ] Configuration management
- [ ] Challenge addition and validation

### Phase 4: Sync & Notifications (Weeks 7-8)
- [ ] GitHub sync provider
- [ ] S3 sync provider (optional)
- [ ] Cross-platform notifications
- [ ] Conflict resolution logic

### Phase 5: Polish & Testing (Weeks 9-10)
- [ ] Comprehensive testing suite
- [ ] Documentation and examples
- [ ] Cross-platform validation
- [ ] Performance optimization

---

## 10. Architecture Benefits

**✅ Modularity:** Clear separation between CLI, core logic, storage, and utilities  
**✅ Maintainability:** Well-defined interfaces and trait-based sync providers  
**✅ Scalability:** Database schema supports analytics, multi-user, and performance optimization  
**✅ Cross-platform:** Platform-specific code isolated behind traits and feature flags  
**✅ Offline-first:** Core functionality works without network, sync is additive  
**✅ Testability:** Clear boundaries enable comprehensive unit and integration testing

**Key Architectural Benefits:**
- **FSRS Implementation:** Proper schema for stability/difficulty tracking with review history
- **Content-Hash Deduplication:** Prevents duplicate challenges across imports
- **Trait-based Sync:** Easy to add new providers (GitLab, Dropbox, etc.)
- **Backup Strategy:** Multiple levels from DB-only to full ZIP export
- **Configuration Management:** Flexible TOML-based config with environment overrides

---

## 11. Security Considerations

- **No sensitive data in challenges:** Content is public by design
- **Environment variables for tokens:** GitHub/S3 credentials via env vars only
- **Local-only by default:** No network access required for core functionality
- **Content validation:** Verify challenge structure and hash integrity
- **Safe file operations:** Validate paths to prevent directory traversal

---

## 12. Future Extensions

- **Plugin system:** Custom sync providers via dynamic loading
- **Statistics dashboard:** Web interface for progress visualization
- **Team challenges:** Shared challenge libraries for organizations
- **AI integration:** Automated difficulty assessment and hint generation
- **Mobile companion:** Read-only mobile app for on-the-go review
- **IDE extensions:** Direct integration with VS Code, Neovim, etc.

---

*This architecture document serves as the complete blueprint for implementing CodeRecall CLI. The modular design allows for incremental development while maintaining a solid foundation for the spaced repetition algorithm and cross-platform compatibility.*