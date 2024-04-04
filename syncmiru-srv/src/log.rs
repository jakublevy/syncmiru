use std::fs::{OpenOptions};
use simplelog::{ColorChoice, Config, TerminalMode, TermLogger, WriteLogger};
use crate::config::{LogConfig, LogOutput};
use crate::result::Result;

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