use std::fmt::Display;
use std::fs;
use std::fs::File;
use std::io::{Read};
use std::path::{Path, PathBuf};
use anyhow::{anyhow, Context};
use josekit::jws::{JwsSigner, JwsVerifier};
use lettre::SmtpTransport;
use lettre::transport::smtp::authentication::Credentials;
use log::{debug, info, warn};
use openssl::hash::MessageDigest;
use yaml_rust2::{Yaml, YamlLoader};
use crate::config::KeyAlg::{ES256, ES512, RS256, RS512};
use crate::config::LogOutput::{StdErr, Stdout};
use crate::error::SyncmiruError;
use crate::result::Result;

pub fn read(config_file: impl AsRef<Path> + Copy) -> Result<Config> {
    let cf_print = &config_file.as_ref().to_string_lossy();
    debug!("Parsing {}", cf_print);
    let mut yaml_str: String = Default::default();
    File::open(config_file)?.read_to_string(&mut yaml_str)?;
    let docs = YamlLoader::load_from_str(&yaml_str)?;
    let doc = &docs[0];

    let srv = SrvConfig::from(&doc["srv"])?;
    let reg_pub = RegConfig::from(&doc["registration_public"])?;
    let db = DbConfig::from(&doc["db"])?;
    let log = LogConfig::from(&doc["log"])?;
    let email = EmailConf::from(&doc["email"])?;
    let login_jwt = LoginJwt::from(&doc["login_jwt"])?;

    info!("{} parsed", cf_print);
    Ok(
        Config { srv, reg_pub, db, log, email, login_jwt }
    )
}

#[derive(Debug, Clone)]
pub struct Config {
    pub srv: SrvConfig,
    pub reg_pub: RegConfig,
    pub db: DbConfig,
    pub log: LogConfig,
    pub email: EmailConf,
    pub login_jwt: LoginJwt,
    //sources: Vec<Source>
}

#[derive(Debug, Clone)]
pub struct SrvConfig {
    pub url: String,
    pub port: u16
}

impl SrvConfig {
    pub fn from(srv_yaml: &Yaml) -> Result<Self> {
        let url = srv_yaml["url"]
            .as_str()
            .context("url is missing in section srv")?
            .to_string();

        let port = srv_yaml["port"]
            .as_i64()
            .context("port is missing in section srv")? as u16;

        Ok(Self { url, port })
    }
}

#[derive(Debug, Clone)]
pub struct DbConfig {
    pub name: String,
    pub host: String,
    pub user: String,
    pub password: String,
    pub port: u16
}

impl DbConfig {
    pub fn from(db_yaml: &Yaml) -> Result<Self> {
        let name = db_yaml["name"]
            .as_str()
            .context("name is missing in db section")?
            .to_string();
        let host = db_yaml["host"]
            .as_str()
            .context("host is missing in db section")?
            .to_string();
        let user = db_yaml["user"]
            .as_str()
            .context("user is missing in db section")?
            .to_string();
        let password = db_yaml["password"]
            .as_str()
            .context("password is missing in db section")?
            .to_string();
        let mut port = 5432u16;
        if !db_yaml["port"].is_badvalue() {
            port = db_yaml["port"]
                .as_i64()
                .context("port in db section is not integral value")? as u16;
        }
        else {
            warn!("No port value defined, assuming psql default 5432");
        }

        Ok(
            Self { name, host, user, password, port }
        )
    }
}

#[derive(Debug, Clone)]
pub struct RegConfig {
    pub allowed: bool,
    pub hcaptcha_secret: Option<String>,
}

impl RegConfig {
    pub fn from(reg_yaml: &Yaml) -> Result<Self> {
        let mut hcaptcha_secret: Option<String> = None;
        let allowed = reg_yaml["allowed"]
            .as_bool()
            .context("allowed is missing in registration_public section")?;

        let hs = &reg_yaml["hcaptcha_secret"];
        if allowed {
            if !hs.is_badvalue() {
                hcaptcha_secret = Some(hs.as_str()
                    .context("hcaptcha_secret is missing inside registration_public")?
                    .to_string());
            }
            else {
                warn!("Public registration allowed but hcaptcha disabled");
            }
        }
        Ok(
            Self { allowed, hcaptcha_secret }
        )
    }
}

#[derive(Debug, Clone)]
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

#[derive(Debug, PartialEq, Clone)]
pub enum LogOutput {
    File(PathBuf),
    Stdout,
    StdErr
}

#[derive(Debug, PartialEq, Copy, Clone)]
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

#[derive(Debug, Clone)]
pub struct EmailConf {
    pub smtp_host: String,
    pub smtp_port: u16,
    pub credentials: Credentials,
    pub from: String,
    pub wait_before_resend: i64,
    pub token_valid_time: i64,
    pub rates: Option<EmailRates>
}

impl EmailConf {
    pub fn from(email: &Yaml) -> Result<Self> {
        let smtp_host = email["smtp_host"]
            .as_str()
            .context("smtp_host is missing inside email section")?
            .to_string();
        let smtp_port = email["smtp_port"]
            .as_i64()
            .context("smtp_port is missing inside email section")? as u16;


        let username = email["username"]
            .as_str()
            .context("username is missing inside email section")?
            .to_string();
        let password = email["password"]
            .as_str()
            .context("password is missing inside email section")?
            .to_string();
        let credentials = Credentials::new(username, password);


        let from = email["from"]
            .as_str()
            .context("from is missing inside email section")?
            .to_string();
        let wait_before_resend = email["wait_before_resend"]
            .as_i64()
            .context("wait_before_resend in missing inside email section")?;
        let token_valid_time = email["token_valid_time"]
            .as_i64()
            .context("token_valid_time is missing inside email section")?;
        let mut rates: Option<EmailRates> = None;
        if !email["rates"].is_badvalue() {
            rates = Some(EmailRates::from(&email["rates"])?);
        }
        else {
            warn!("Email rate limiting is disabled")
        }
        Ok(Self {
            smtp_host,
            smtp_port,
            credentials,
            from,
            wait_before_resend,
            token_valid_time,
            rates
        })
    }
}

#[derive(Debug, Copy, Clone)]
pub struct EmailRates {
    pub forgotten_password: Option<Rate>,
    pub verification: Option<Rate>
}

impl EmailRates {
    pub fn from(rates_yaml: &Yaml) -> Result<Self> {
        let mut rates = Self { forgotten_password: None, verification: None };

        let fp_yaml = &rates_yaml["forgotten_password"];
        if !fp_yaml.is_badvalue() {
            let (fp_max, fp_per) = parse_rate(fp_yaml)?;
            rates.forgotten_password = Some(Rate { max: fp_max, per: fp_per });
        }
        else {
            warn!("Rate limiting for forgotten_password emails is disabled")
        }

        let ver_yaml = &rates_yaml["verification"];
        if !ver_yaml.is_badvalue() {
            let (ver_max, ver_per) = parse_rate(&ver_yaml)?;
            rates.verification = Some(Rate { max: ver_max, per: ver_per });
        }
        else {
            warn!("Rate limiting for verification emails is disabled")
        }
        Ok(rates)
    }
}

fn parse_rate(rate_yaml: &Yaml) -> Result<(i64, i64)> {
    let max = rate_yaml["max"].as_i64().context("rate is missing max value")?;
    let per = rate_yaml["per"].as_i64().context("rate is missing per value")?;
    return Ok((max, per))
}

#[derive(Debug, Copy, Clone)]
pub struct Rate {
    pub max: i64,
    pub per: i64
}

#[derive(Debug, Clone)]
struct Source {
    dir_read_url: String,
    dir_format: DirFormat,
    dir_read_jwt: String,
    client_url: String,
    client_acc_priv_pem: Vec<u8>
}

#[derive(Debug, Copy, Clone)]
enum DirFormat {
    NginxJson, NginxHtml, Apache2Html
}

#[derive(Debug, Clone)]
pub struct LoginJwt {
    pub priv_pem: Vec<u8>,
    pub pub_pem: Vec<u8>,
    pub alg: KeyAlg
}

impl LoginJwt {
    pub fn from(yaml: &Yaml) -> Result<Self> {
        let alg_str = yaml["algorithm"]
            .as_str()
            .context("algorithm is missing in login_jwt section")?
            .to_lowercase();
        let alg = KeyAlg::from(alg_str.as_ref())
            .context("Invalid algorithm inside login_jwt section")?;
        let priv_key_file = PathBuf::from(
            yaml["priv_key_file"]
            .as_str()
            .context("priv_key_file is missing inside login_jwt")?
        );
        let priv_pem = parse_key(priv_key_file, KeyType::Private, alg)?;
        let pub_key_file = PathBuf::from(
            yaml["pub_key_file"]
                .as_str()
                .context("pub_key_file is missing inside login_jwt")?
        );
        let pub_pem = parse_key(pub_key_file, KeyType::Public, alg)?;
        Ok(Self { pub_pem, priv_pem, alg })
    }

    pub fn signer(&self) -> Result<Box<dyn JwsSigner>> {
        match self.alg {
            RS256 => Ok(Box::new(josekit::jws::RS256.signer_from_pem(&self.priv_pem)?)),
            RS512 => Ok(Box::new(josekit::jws::RS512.signer_from_pem(&self.priv_pem)?)),
            ES256 => Ok(Box::new(josekit::jws::ES256.signer_from_pem(&self.priv_pem)?)),
            ES512 => Ok(Box::new(josekit::jws::ES512.signer_from_pem(&self.priv_pem)?)),
        }
    }

    pub fn verifier(&self) -> Result<Box<dyn JwsVerifier>> {
        match self.alg {
            RS256 => Ok(Box::new(josekit::jws::RS256.verifier_from_pem(&self.pub_pem)?)),
            RS512 => Ok(Box::new(josekit::jws::RS512.verifier_from_pem(&self.pub_pem)?)),
            ES256 => Ok(Box::new(josekit::jws::ES256.verifier_from_pem(&self.pub_pem)?)),
            ES512 => Ok(Box::new(josekit::jws::ES512.verifier_from_pem(&self.pub_pem)?)),
        }
    }

}

#[derive(PartialEq)]
enum KeyType {
    Private,
    Public
}


#[derive(Debug, Copy, Clone, PartialEq)]
pub enum KeyAlg {
    RS256,
    RS512,
    ES256,
    ES512
}

impl KeyAlg {
    pub fn from(s: &str) -> Option<KeyAlg> {
        match s.to_lowercase().as_str() {
            "rs256" => Some(RS256),
            "rs512" => Some(RS512),
            "es256" => Some(ES256),
            "es512" => Some(ES512),
            _ => None
        }
    }
}

fn parse_key(p: impl AsRef<Path> + Clone, kt: KeyType, ka: KeyAlg) -> Result<Vec<u8>> {
    if !p.as_ref().exists() {
        return Err(SyncmiruError::JwtKeyParseError(format!("{} does not exists", p.as_ref().display())))
    }
    let pem_str = fs::read_to_string(p.clone())?;
    let pem_bytes = pem_str.as_bytes();
    let pem = pem::parse(pem_bytes)?;
    let expected_tag = match (kt, ka) {
        (KeyType::Private, RS256) | (KeyType::Private, RS512) => "PRIVATE KEY",
        (KeyType::Public, RS256) | (KeyType::Public, RS512) => "PUBLIC KEY",
        (KeyType::Private, ES256) | (KeyType::Private, ES512) => "EC PRIVATE KEY",
        (KeyType::Public, ES256) | (KeyType::Public, ES512) => "PUBLIC KEY",
    };
    if pem.tag() != expected_tag {
        return Err(SyncmiruError::JwtKeyParseError(format!("{} does not appear to be a valid {}", p.as_ref().display(), expected_tag)))
    }
    Ok(pem_bytes.to_vec())
}