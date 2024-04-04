use std::io;

#[derive(thiserror::Error, Debug)]
pub enum SyncmiruError {
    #[error("Parsing CLI args failed")]
    CliParseFailed(String),

    #[error("io error occurred")]
    IoError(#[from] io::Error),

    #[error("logger error")]
    LoggerError(#[from] log::SetLoggerError),

    #[error("Error while scanning YAML")]
    YamlScanError(#[from] yaml_rust2::ScanError),

    #[error("DB error")]
    SqlxError(#[from] sqlx::error::Error),

    #[error("DB migration error")]
    MigrationError(#[from] sqlx::migrate::MigrateError),

    #[error("Yaml invalid")]
    YamlInvalid(String),

    #[error("Internal error")]
    InternalError(#[from] anyhow::Error),
}
