use std::fs::File;
use std::io::{Read};
use std::path::{Path, PathBuf};
use anyhow::Context;
use yaml_rust2::{Yaml, YamlLoader};
use crate::config::LogOutput::{StdErr, Stdout};
use crate::error::SyncmiruError;
use crate::result::Result;

pub fn read_config(config_file: impl AsRef<Path>) -> Result<Config> {
    let mut yaml_str: String = Default::default();
    File::open(config_file)?.read_to_string(&mut yaml_str)?;
    let docs = YamlLoader::load_from_str(&yaml_str)?;
    let doc = &docs[0];

    let reg_allowed = doc["registration_allowed"]
        .as_bool()
        .context("registration_allowed is missing")?;

    let port = doc["port"]
        .as_i64()
        .context("port is missing")? as u16;

    let db_connection_str = doc["db_connection_str"]
        .as_str()
        .context("db_connection_str is missing")?
        .to_string();

    let log = LogConfig::from(&doc["log"])?;
    let rates = Rates::from(&doc["rates"])?;
    let login_jwt_cert = LoginJwtCert::from(&doc["login_jwt_cert"])?;

    Ok(
        Config { reg_allowed, port, db_connection_str, log, rates, login_jwt_cert }
    )
}

#[derive(Debug)]
pub struct Config {
    pub reg_allowed: bool,
    pub port: u16,
    pub db_connection_str: String,
    pub log: LogConfig,
    pub rates: Rates,
    pub login_jwt_cert: LoginJwtCert,
    //sources: Vec<Source>
}

#[derive(Debug)]
pub struct LogConfig {
    pub output: LogOutput,
    pub level: LogLevel,
}

impl LogConfig {
    pub fn from(log_yaml: &Yaml) -> Result<Self> {
        let output = log_yaml["output"]
            .as_str()
            .context("output is missing in log section")?
            .to_lowercase();
        let mut output_type: LogOutput;
        if output == "stdout" {
            output_type = Stdout;
        }
        else if output == "stderr" {
            output_type = StdErr;
        }
        else if output == "file" {
            let file = log_yaml["file"]
                .as_str()
                .context("file is missing in log section")?;
            output_type = LogOutput::File(PathBuf::from(file));
        }
        else {
            return Err(SyncmiruError::YamlInvalid("Invalid output inside log section".to_string()))
        }
        let level_str = log_yaml["level"]
            .as_str()
            .context("level is missing in log section")?
            .to_lowercase();
        let level = LogLevel::from(level_str.as_ref())
            .context("Invalid level inside log section")?;
        Ok(
            Self { output: output_type, level }
        )
    }
}

#[derive(Debug, PartialEq)]
pub enum LogOutput {
    File(PathBuf),
    Stdout,
    StdErr
}

#[derive(Debug, PartialEq)]
pub enum LogLevel {
    Error, Warn, Info, Debug, Trace
}

impl LogLevel {
    pub fn from(s: &str) -> Option<LogLevel> {
        match s.to_lowercase().as_str() {
            "error" => Some(Self::Error),
            "warn" => Some(Self::Warn),
            "info" => Some(Self::Info),
            "debug" => Some(Self::Debug),
            "trace" => Some(Self::Trace),
            _ => None
        }
    }
}

impl From<LogLevel> for simplelog::LevelFilter {
    fn from(value: LogLevel) -> Self {
        match value {
            LogLevel::Error => simplelog::LevelFilter::Error,
            LogLevel::Warn => simplelog::LevelFilter::Warn,
            LogLevel::Info => simplelog::LevelFilter::Info,
            LogLevel::Debug => simplelog::LevelFilter::Debug,
            LogLevel::Trace => simplelog::LevelFilter::Trace,
        }
    }
}

#[derive(Debug)]
struct EmailConf {
    smtp_host: String,
    smtp_port: u16,
    username: String,
    password: String,
    from_mail: String,
    security: String
}

#[derive(Debug)]
struct Rates {
    forgotten_password: Option<Rate>,
    display_name_change: Option<Rate>
}

impl Rates {
    pub fn from(rates_yaml: &Yaml) -> Result<Self> {
        let mut rates = Self { forgotten_password: None, display_name_change: None };

        let fp_yaml = &rates_yaml["forgotten_password"];
        if !fp_yaml.is_badvalue() {
            let (fp_max, fp_per) = parse_rate(fp_yaml)?;
            rates.forgotten_password = Some(Rate { max: fp_max, per: fp_per });
        }

        let dnc_yaml = &rates_yaml["display_name_change"];
        if !dnc_yaml.is_badvalue() {
            let (dnc_max, dnc_per) = parse_rate(&dnc_yaml)?;
            rates.display_name_change = Some(Rate { max: dnc_max, per: dnc_per });
        }
        Ok(rates)
    }
}

fn parse_rate(rate_yaml: &Yaml) -> Result<(u32, u32)> {
    let max = rate_yaml["max"].as_i64().context("rate is missing max value")? as u32;
    let per = rate_yaml["per"].as_i64().context("rate is missing per value")? as u32;
    return Ok((max, per))
}

#[derive(Debug)]
struct Rate {
    max: u32,
    per: u32
}

#[derive(Debug)]
struct Source {
    dir_read_url: String,
    dir_format: DirFormat,
    dir_read_jwt: String,
    client_url: String,
    client_acc_priv_key_file: PathBuf
}

#[derive(Debug)]
enum DirFormat {
    NginxJson, NginxHtml, Apache2Html
}

#[derive(Debug)]
struct LoginJwtCert {
    priv_key_file: PathBuf,
    pub_key_file: PathBuf
}

impl LoginJwtCert {
    pub fn from(yaml: &Yaml) -> Result<Self> {
        let priv_key_file = PathBuf::from(
            yaml["priv_key_file"]
            .as_str()
            .context("priv_key_file is missing inside login_jwt_cert")?
        );
        let pub_key_file = PathBuf::from(
            yaml["pub_key_file"]
                .as_str()
                .context("pub_key_file is missing inside login_jwt_cert")?
        );
        Ok(LoginJwtCert { priv_key_file, pub_key_file })
    }
}