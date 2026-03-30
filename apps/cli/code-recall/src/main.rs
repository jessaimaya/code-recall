use anyhow::Result;
use core_rs::{config::Config, db};

fn main() -> Result<()> {
    let config = Config::load()?;
    let _conn = db::open(&config.db_path)?;
    println!("code-recall");
    Ok(())
}
