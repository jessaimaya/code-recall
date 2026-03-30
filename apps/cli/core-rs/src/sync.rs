//! Sync unsynced local reviews to the Turso cloud database via its HTTP API.
//!
//! Strategy
//! --------
//! * `reviews` is append-only and is the single source of truth.
//! * `synced_at IS NULL` means the review has not been pushed to Turso yet.
//! * After a successful push `synced_at` is stamped with the current UTC time.
//! * If the device is offline the review stays unsynced and is retried on the
//!   next call to [`push_unsynced`].
//! * Conflict resolution: both sides keep every review. When two devices review
//!   the same card offline, both rows are uploaded and FSRS is applied to them
//!   in `review_at` order on the cloud side.

use anyhow::{Context, Result};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};

// ─── Types ────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct SyncConfig {
    pub turso_url: String,
    pub turso_token: String,
}

#[derive(Debug, Serialize)]
struct UnsyncedReview {
    id: String,
    card_id: String,
    rating: i64,
    elapsed_days: f64,
    scheduled_days: f64,
    review_at: String,
}

// ─── Turso HTTP API types ──────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
struct TursoPipeline {
    requests: Vec<TursoRequest>,
}

#[derive(Debug, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
enum TursoRequest {
    Execute { stmt: TursoStmt },
}

#[derive(Debug, Serialize)]
struct TursoStmt {
    sql: String,
    args: Vec<TursoValue>,
}

#[derive(Debug, Serialize)]
#[serde(untagged)]
enum TursoValue {
    Text(String),
    Integer(i64),
    Real(f64),
}

#[derive(Debug, Deserialize)]
struct TursoPipelineResponse {
    results: Vec<TursoResult>,
}

#[derive(Debug, Deserialize)]
struct TursoResult {
    #[serde(rename = "type")]
    kind: String,
    error: Option<TursoError>,
}

#[derive(Debug, Deserialize)]
struct TursoError {
    message: String,
}

// ─── Public API ───────────────────────────────────────────────────────────────

/// Push all unsynced reviews to Turso and stamp `synced_at` on success.
///
/// Returns the number of reviews successfully synced.
/// If no `SyncConfig` is provided (e.g. offline-only mode) this is a no-op.
pub async fn push_unsynced(conn: &Connection, cfg: &SyncConfig) -> Result<usize> {
    let reviews = collect_unsynced(conn)?;
    if reviews.is_empty() {
        return Ok(0);
    }

    let client = reqwest::Client::new();
    let mut synced = 0;

    for review in &reviews {
        match push_one(&client, cfg, review).await {
            Ok(()) => {
                mark_synced(conn, &review.id)?;
                synced += 1;
            }
            Err(e) => {
                // Log and continue — the row stays unsynced for the next attempt.
                eprintln!("sync: failed to push review {}: {e}", review.id);
            }
        }
    }

    Ok(synced)
}

/// Try to sync; if the device appears offline, return `Ok(0)` silently.
pub async fn try_push_unsynced(conn: &Connection, cfg: &SyncConfig) -> Result<usize> {
    match push_unsynced(conn, cfg).await {
        Ok(n) => Ok(n),
        Err(e) if is_network_error(&e) => Ok(0),
        Err(e) => Err(e),
    }
}

// ─── Internals ────────────────────────────────────────────────────────────────

fn collect_unsynced(conn: &Connection) -> Result<Vec<UnsyncedReview>> {
    let mut stmt = conn
        .prepare(
            "SELECT id, card_id, rating, elapsed_days, scheduled_days, review_at
             FROM reviews
             WHERE synced_at IS NULL
             ORDER BY review_at ASC",
        )
        .context("Failed to prepare unsynced query")?;

    let rows = stmt
        .query_map([], |row| {
            Ok(UnsyncedReview {
                id: row.get(0)?,
                card_id: row.get(1)?,
                rating: row.get(2)?,
                elapsed_days: row.get(3)?,
                scheduled_days: row.get(4)?,
                review_at: row.get(5)?,
            })
        })
        .context("Failed to query unsynced reviews")?
        .collect::<rusqlite::Result<Vec<_>>>()
        .context("Failed to collect unsynced reviews")?;

    Ok(rows)
}

async fn push_one(
    client: &reqwest::Client,
    cfg: &SyncConfig,
    review: &UnsyncedReview,
) -> Result<()> {
    let pipeline_url = format!("{}/v2/pipeline", cfg.turso_url.trim_end_matches('/'));

    let body = TursoPipeline {
        requests: vec![TursoRequest::Execute {
            stmt: TursoStmt {
                sql: "INSERT OR IGNORE INTO reviews \
                      (id, card_id, rating, elapsed_days, scheduled_days, review_at) \
                      VALUES (?, ?, ?, ?, ?, ?)"
                    .into(),
                args: vec![
                    TursoValue::Text(review.id.clone()),
                    TursoValue::Text(review.card_id.clone()),
                    TursoValue::Integer(review.rating),
                    TursoValue::Real(review.elapsed_days),
                    TursoValue::Real(review.scheduled_days),
                    TursoValue::Text(review.review_at.clone()),
                ],
            },
        }],
    };

    let resp = client
        .post(&pipeline_url)
        .bearer_auth(&cfg.turso_token)
        .json(&body)
        .send()
        .await
        .context("HTTP request to Turso failed")?;

    let status = resp.status();
    let parsed: TursoPipelineResponse = resp
        .json()
        .await
        .context("Failed to parse Turso response")?;

    for result in &parsed.results {
        if result.kind == "error" {
            let msg = result
                .error
                .as_ref()
                .map(|e| e.message.as_str())
                .unwrap_or("unknown error");
            anyhow::bail!("Turso returned error (HTTP {status}): {msg}");
        }
    }

    Ok(())
}

fn mark_synced(conn: &Connection, review_id: &str) -> Result<()> {
    conn.execute(
        "UPDATE reviews SET synced_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?1",
        [review_id],
    )
    .context("Failed to mark review as synced")?;
    Ok(())
}

fn is_network_error(e: &anyhow::Error) -> bool {
    e.chain()
        .any(|cause| cause.downcast_ref::<reqwest::Error>().is_some())
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db;

    fn seed_review(conn: &Connection) -> String {
        let id = "rev-test-1".to_string();
        conn.execute(
            "INSERT INTO users (id, email, name) VALUES ('u1', 'a@b.com', 'Test')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO decks (id, user_id, name) VALUES ('d1', 'u1', 'Deck')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO cards (id, deck_id, card_type, title, content) \
             VALUES ('c1', 'd1', 'CODING', 'T', 'C')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO reviews (id, card_id, rating, elapsed_days, scheduled_days) \
             VALUES (?1, 'c1', 3, 0.0, 1.0)",
            [&id],
        )
        .unwrap();
        id
    }

    #[test]
    fn collect_unsynced_returns_new_reviews() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        db::run_migrations_for_test(&conn).unwrap();

        let id = seed_review(&conn);
        let rows = collect_unsynced(&conn).unwrap();
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].id, id);
    }

    #[test]
    fn mark_synced_clears_row() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        db::run_migrations_for_test(&conn).unwrap();

        let id = seed_review(&conn);
        mark_synced(&conn, &id).unwrap();

        let rows = collect_unsynced(&conn).unwrap();
        assert!(rows.is_empty());
    }
}
