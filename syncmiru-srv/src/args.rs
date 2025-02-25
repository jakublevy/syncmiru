use std::fs;
use std::path::PathBuf;
use clap::Parser;
use log::{debug, info};
use crate::result::Result;
use crate::error::SyncmiruError;

pub struct Args {
    pub config_file: PathBuf
}

impl Args {
    pub fn parse() -> Result<Self> {
        debug!("Parsing CLI args");
        let cli = Cli::parse();
        let config_file = PathBuf::from(fs::canonicalize(cli.config)?);
        if !config_file.exists() {
            return Err(SyncmiruError::CliParseFailed(
                format!("{} does not appear to be a valid file", config_file.to_string_lossy()))
            )
        }
        info!("CLI args parsed");
        Ok(Self { config_file })
    }
}

#[derive(Parser)]
#[command(version, about, long_about = None)]
struct Cli {
    #[arg(short, long, value_name = "CONFIG_FILE", default_value = "./config.yaml")]
    /// Path to YAML configuration file
    config: String
}