//! This module provides functionality for configuring and initializing the logging
//! system based on application configuration.

use std::fs::{OpenOptions};
use simplelog::{ColorChoice, Config, TerminalMode, TermLogger, WriteLogger};
use crate::config::{LogConfig, LogOutput};
use crate::result::Result;


/// Sets up the logging system based on the provided configuration.
///
/// # Arguments
/// - `log_conf`: Reference to a `LogConfig` object containing logging settings such as output
///   destination and log level.
///
///
/// # Errors
/// - Returns an error if the log file cannot be created or opened.
/// - Errors may also occur if the logger initialization fails.
pub fn setup(log_conf: &LogConfig) -> Result<()> {
    if let LogOutput::File(f) = &log_conf.output {
        let log_file = OpenOptions::new()
            .write(true)
            .append(true)
            .create(true)
            .open(f)?;
        WriteLogger::init(log_conf.level.into(), Config::default(), log_file)?;
    }
    else if log_conf.output == LogOutput::Stdout {
        TermLogger::init(log_conf.level.into(), Config::default(), TerminalMode::Stdout, ColorChoice::Auto)?;
    }
    else if log_conf.output == LogOutput::StdErr {
        TermLogger::init(log_conf.level.into(), Config::default(), TerminalMode::Stderr, ColorChoice::Auto)?;
    }
    Ok(())
}