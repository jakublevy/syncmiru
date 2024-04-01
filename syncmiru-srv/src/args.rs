use std::path::PathBuf;
use clap::Parser;
use crate::result::Result;
use crate::error::SyncmiruError;

pub struct Args {
    pub config_file: PathBuf
}

impl Args {
    pub fn parse() -> Result<Self> {
        let cli = Cli::parse();
        let config_file = PathBuf::from(cli.config);
        if !config_file.exists() {
            return Err(SyncmiruError::CliParseFailed)
        }
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