use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Deserialize, Serialize)]
pub struct Config {
    pub db_path: PathBuf,
}

impl Config {
    pub fn load() -> Result<Self> {
        let config_path = config_file_path();

        if config_path.exists() {
            let raw = std::fs::read_to_string(&config_path)
                .with_context(|| format!("Failed to read config at {}", config_path.display()))?;
            let cfg: Config = toml::from_str(&raw).context("Failed to parse config.toml")?;
            return Ok(cfg);
        }

        Ok(Self::default())
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            db_path: default_db_path(),
        }
    }
}

pub fn app_dir() -> PathBuf {
    dirs::home_dir()
        .expect("Could not determine home directory")
        .join(".devflash")
}

pub fn config_file_path() -> PathBuf {
    app_dir().join("config.toml")
}

pub fn default_db_path() -> PathBuf {
    app_dir().join("devflash.db")
}
