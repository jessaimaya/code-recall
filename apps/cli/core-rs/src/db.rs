use anyhow::{Context, Result};
use rusqlite::Connection;
use std::path::Path;

const MIGRATIONS: &[&str] = &[
    // 0001 — initial schema (synced_at included from the start)
    "CREATE TABLE IF NOT EXISTS users (
        id          TEXT PRIMARY KEY NOT NULL,
        email       TEXT NOT NULL UNIQUE,
        name        TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE TABLE IF NOT EXISTS decks (
        id          TEXT PRIMARY KEY NOT NULL,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name        TEXT NOT NULL,
        description TEXT,
        created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE TABLE IF NOT EXISTS cards (
        id          TEXT PRIMARY KEY NOT NULL,
        deck_id     TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
        card_type   TEXT NOT NULL CHECK(card_type IN ('MULTIPLE_CHOICE','CODING','OPEN_ENDED')),
        title       TEXT NOT NULL,
        content     TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        stability   REAL NOT NULL DEFAULT 0,
        difficulty  REAL NOT NULL DEFAULT 0,
        due_date    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        last_review TEXT,
        reps        INTEGER NOT NULL DEFAULT 0,
        lapses      INTEGER NOT NULL DEFAULT 0,
        state       TEXT NOT NULL DEFAULT 'NEW'
                        CHECK(state IN ('NEW','LEARNING','REVIEW','RELEARNING'))
    );
    CREATE TABLE IF NOT EXISTS reviews (
        id             TEXT PRIMARY KEY NOT NULL,
        card_id        TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        rating         INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 4),
        elapsed_days   REAL NOT NULL,
        scheduled_days REAL NOT NULL,
        review_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        synced_at      TEXT
    );
    CREATE TABLE IF NOT EXISTS test_cases (
        id              TEXT PRIMARY KEY NOT NULL,
        card_id         TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        input           TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        is_hidden       INTEGER NOT NULL DEFAULT 0,
        description     TEXT
    );
    CREATE TABLE IF NOT EXISTS options (
        id          TEXT PRIMARY KEY NOT NULL,
        card_id     TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        body        TEXT NOT NULL,
        is_correct  INTEGER NOT NULL DEFAULT 0,
        explanation TEXT
    );",
];

/// Open (or create) the database at `db_path`, run any pending migrations,
/// and return the connection. The parent directory is created if missing.
pub fn open(db_path: &Path) -> Result<Connection> {
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)
            .with_context(|| format!("Failed to create directory {}", parent.display()))?;
    }

    let conn = Connection::open(db_path)
        .with_context(|| format!("Failed to open database at {}", db_path.display()))?;

    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")
        .context("Failed to set PRAGMAs")?;

    run_migrations(&conn)?;

    Ok(conn)
}

/// Exposed for use in tests across crate modules.
#[cfg(test)]
pub fn run_migrations_for_test(conn: &Connection) -> Result<()> {
    run_migrations(conn)
}

fn run_migrations(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id         INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );",
    )
    .context("Failed to create migrations table")?;

    let applied: usize = conn
        .query_row("SELECT COUNT(*) FROM _migrations", [], |row| row.get(0))
        .context("Failed to query applied migrations")?;

    for (i, sql) in MIGRATIONS.iter().enumerate().skip(applied) {
        conn.execute_batch(sql)
            .with_context(|| format!("Migration {} failed", i + 1))?;
        conn.execute(
            "INSERT INTO _migrations (id) VALUES (?1)",
            [i as i64 + 1],
        )
        .with_context(|| format!("Failed to record migration {}", i + 1))?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_open_in_memory() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        run_migrations(&conn).unwrap();
        // Running twice is idempotent
        run_migrations(&conn).unwrap();
    }

    #[test]
    fn test_open_creates_directory() {
        let dir = tempfile::tempdir().unwrap();
        let db_path = dir.path().join("nested/devflash.db");
        let _conn = open(&db_path).unwrap();
        assert!(db_path.exists());
    }
}
