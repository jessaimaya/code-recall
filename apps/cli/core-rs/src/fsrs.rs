use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use rs_fsrs::{Card, Parameters, Rating as FsrsRating, State, FSRS};
use rusqlite::Connection;

// ─── Domain types ─────────────────────────────────────────────────────────────

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct FsrsCard {
    pub id: String,
    pub stability: f64,
    pub difficulty: f64,
    pub due_date: String,           // ISO 8601
    pub last_review: Option<String>,
    pub reps: i64,
    pub lapses: i64,
    pub state: String,              // "NEW" | "LEARNING" | "REVIEW" | "RELEARNING"
}

#[derive(Debug, Clone)]
pub struct ReviewOutcome {
    pub updated_card: FsrsCard,
    pub elapsed_days: i64,
    pub scheduled_days: i64,
    pub review_at: String, // ISO 8601
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

fn state_to_fsrs(state: &str) -> State {
    match state {
        "LEARNING" => State::Learning,
        "REVIEW" => State::Review,
        "RELEARNING" => State::Relearning,
        _ => State::New,
    }
}

fn fsrs_to_state(state: State) -> &'static str {
    match state {
        State::New => "NEW",
        State::Learning => "LEARNING",
        State::Review => "REVIEW",
        State::Relearning => "RELEARNING",
    }
}

fn rating_from_u8(rating: u8) -> Result<FsrsRating> {
    match rating {
        1 => Ok(FsrsRating::Again),
        2 => Ok(FsrsRating::Hard),
        3 => Ok(FsrsRating::Good),
        4 => Ok(FsrsRating::Easy),
        other => anyhow::bail!("invalid rating {other}: must be 1–4"),
    }
}

fn to_rs_card(card: &FsrsCard) -> Result<Card> {
    let due = card
        .due_date
        .parse::<DateTime<Utc>>()
        .with_context(|| format!("invalid due_date: {}", card.due_date))?;

    let last_review = card
        .last_review
        .as_deref()
        .map(|s| {
            s.parse::<DateTime<Utc>>()
                .with_context(|| format!("invalid last_review: {s}"))
        })
        .transpose()?
        .unwrap_or(due);

    Ok(Card {
        due,
        stability: card.stability,
        difficulty: card.difficulty,
        reps: card.reps as i32,
        lapses: card.lapses as i32,
        state: state_to_fsrs(&card.state),
        last_review,
        elapsed_days: 0,
        scheduled_days: 0,
    })
}

fn from_rs_card(id: &str, card: &Card) -> FsrsCard {
    FsrsCard {
        id: id.to_string(),
        stability: card.stability,
        difficulty: card.difficulty,
        due_date: card.due.to_rfc3339(),
        last_review: Some(card.last_review.to_rfc3339()),
        reps: card.reps as i64,
        lapses: card.lapses as i64,
        state: fsrs_to_state(card.state).to_string(),
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/// Apply a rating (1=Again, 2=Hard, 3=Good, 4=Easy) and return the updated
/// card state. Uses `desired_retention = 0.9` via `Parameters::default()`.
pub fn schedule_card(
    card: &FsrsCard,
    rating: u8,
    now: DateTime<Utc>,
) -> Result<ReviewOutcome> {
    let fsrs_rating = rating_from_u8(rating)?;
    let rs_card = to_rs_card(card)?;

    let fsrs = FSRS::new(Parameters::default()); // request_retention = 0.9
    let record_log = fsrs.repeat(rs_card, now);

    let info = record_log
        .get(&fsrs_rating)
        .with_context(|| format!("no scheduling info for rating {rating}"))?;

    Ok(ReviewOutcome {
        updated_card: from_rs_card(&card.id, &info.card),
        elapsed_days: info.review_log.elapsed_days,
        scheduled_days: info.review_log.scheduled_days,
        review_at: now.to_rfc3339(),
    })
}

/// Return all cards whose `due_date <= now` from the SQLite database.
pub fn get_due_cards(conn: &Connection) -> Result<Vec<FsrsCard>> {
    let now = Utc::now().to_rfc3339();
    let mut stmt = conn
        .prepare(
            "SELECT id, stability, difficulty, due_date, last_review, reps, lapses, state
             FROM cards
             WHERE due_date <= ?1",
        )
        .context("failed to prepare get_due_cards query")?;

    let cards = stmt
        .query_map([&now], |row| {
            Ok(FsrsCard {
                id: row.get(0)?,
                stability: row.get(1)?,
                difficulty: row.get(2)?,
                due_date: row.get(3)?,
                last_review: row.get(4)?,
                reps: row.get(5)?,
                lapses: row.get(6)?,
                state: row.get(7)?,
            })
        })
        .context("failed to query due cards")?
        .collect::<rusqlite::Result<Vec<_>>>()
        .context("failed to collect due cards")?;

    Ok(cards)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::run_migrations_for_test;
    use chrono::TimeZone;

    fn now() -> DateTime<Utc> {
        Utc.with_ymd_and_hms(2024, 1, 1, 12, 0, 0).unwrap()
    }

    fn new_card(id: &str) -> FsrsCard {
        FsrsCard {
            id: id.to_string(),
            stability: 0.0,
            difficulty: 0.0,
            due_date: now().to_rfc3339(),
            last_review: None,
            reps: 0,
            lapses: 0,
            state: "NEW".to_string(),
        }
    }

    fn review_card(id: &str) -> FsrsCard {
        FsrsCard {
            id: id.to_string(),
            stability: 10.0,
            difficulty: 5.0,
            due_date: now().to_rfc3339(),
            last_review: Some(
                Utc.with_ymd_and_hms(2023, 12, 22, 12, 0, 0)
                    .unwrap()
                    .to_rfc3339(),
            ),
            reps: 3,
            lapses: 0,
            state: "REVIEW".to_string(),
        }
    }

    // ── NEW card ──────────────────────────────────────────────────────────────

    #[test]
    fn schedule_new_card_again_not_review() {
        let outcome = schedule_card(&new_card("1"), 1, now()).unwrap();
        assert_ne!(outcome.updated_card.state, "REVIEW");
        let due = outcome.updated_card.due_date.parse::<DateTime<Utc>>().unwrap();
        assert!(due > now());
    }

    #[test]
    fn schedule_new_card_good_future_due() {
        let outcome = schedule_card(&new_card("1"), 3, now()).unwrap();
        let due = outcome.updated_card.due_date.parse::<DateTime<Utc>>().unwrap();
        assert!(due > now(), "dueDate should be in the future after Good");
    }

    #[test]
    fn schedule_new_card_easy_graduates_to_review() {
        let outcome = schedule_card(&new_card("1"), 4, now()).unwrap();
        assert_eq!(outcome.updated_card.state, "REVIEW");
        assert!(outcome.updated_card.reps > 0);
    }

    #[test]
    fn schedule_new_card_good_increments_reps() {
        let outcome = schedule_card(&new_card("1"), 3, now()).unwrap();
        assert!(outcome.updated_card.reps > 0);
    }

    // ── REVIEW card ───────────────────────────────────────────────────────────

    #[test]
    fn schedule_review_card_again_increments_lapses() {
        let outcome = schedule_card(&review_card("1"), 1, now()).unwrap();
        assert!(outcome.updated_card.lapses > 0);
        assert_eq!(outcome.updated_card.state, "RELEARNING");
    }

    #[test]
    fn schedule_review_card_good_stays_in_review() {
        let outcome = schedule_card(&review_card("1"), 3, now()).unwrap();
        assert_eq!(outcome.updated_card.state, "REVIEW");
        let due = outcome.updated_card.due_date.parse::<DateTime<Utc>>().unwrap();
        assert!(due > now());
    }

    #[test]
    fn schedule_review_card_easy_further_than_good() {
        let good = schedule_card(&review_card("1"), 3, now()).unwrap();
        let easy = schedule_card(&review_card("1"), 4, now()).unwrap();
        let good_due = good.updated_card.due_date.parse::<DateTime<Utc>>().unwrap();
        let easy_due = easy.updated_card.due_date.parse::<DateTime<Utc>>().unwrap();
        assert!(easy_due > good_due, "Easy should schedule further than Good");
    }

    // ── get_due_cards ─────────────────────────────────────────────────────────

    fn in_memory_conn() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        run_migrations_for_test(&conn).unwrap();
        conn
    }

    fn insert_card(conn: &Connection, id: &str, due: &str) {
        conn.execute(
            "INSERT OR IGNORE INTO users (id, email, name) VALUES ('u1', 'a@b.com', 'Test')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO decks (id, user_id, name) VALUES ('d1', 'u1', 'Deck')",
            [],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO cards (id, deck_id, card_type, title, content, due_date)
             VALUES (?1, 'd1', 'CODING', 'title', 'content', ?2)",
            rusqlite::params![id, due],
        )
        .unwrap();
    }

    #[test]
    fn get_due_cards_returns_past_cards() {
        let conn = in_memory_conn();
        insert_card(&conn, "c1", "2023-01-01T00:00:00+00:00");
        let due = get_due_cards(&conn).unwrap();
        assert_eq!(due.len(), 1);
        assert_eq!(due[0].id, "c1");
    }

    #[test]
    fn get_due_cards_excludes_future() {
        let conn = in_memory_conn();
        insert_card(&conn, "c2", "2099-01-01T00:00:00+00:00");
        let due = get_due_cards(&conn).unwrap();
        assert!(due.is_empty());
    }

    #[test]
    fn invalid_rating_returns_error() {
        let result = schedule_card(&new_card("1"), 5, now());
        assert!(result.is_err());
    }
}
