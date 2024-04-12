use serde_with::DisplayFromStr;
use std::io;
use axum::http::StatusCode;
use axum::Json;
use axum::response::{IntoResponse, Response};
use validator::ValidationErrors;

#[derive(thiserror::Error, Debug)]
pub enum SyncmiruError {
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

    #[error("Join error")]
    JoinError(#[from] tokio::task::JoinError),

    #[error("HCaptcha invalid")]
    HCaptchaInvalid(#[from] hcaptcha::HcaptchaError),

    #[error("Lettre email address error")]
    LettreAddressError(#[from] lettre::address::AddressError),

    #[error("Lettre error")]
    LettreError(#[from] lettre::error::Error),

    #[error("Lettre SMTP error")]
    LettreSmtpError(#[from] lettre::transport::smtp::Error),

    #[error("Internal error")]
    InternalError(#[from] anyhow::Error),

    #[error("validation error in request body")]
    InvalidEntity(#[from] ValidationErrors),

    #[error("Parsing CLI args failed {0}")]
    CliParseFailed(String),

    #[error("Yaml invalid {0}")]
    YamlInvalid(String),

    #[error("{0}")]
    UnprocessableEntity(String),

    #[error("{0}")]
    Conflict(String),

    #[error("Auth error")]
    AuthError,
}


impl IntoResponse for SyncmiruError {
    fn into_response(self) -> Response {
        #[serde_with::serde_as]
        #[serde_with::skip_serializing_none]
        #[derive(serde::Serialize)]
        struct ErrorResponse<'a> {
            // Serialize the `Display` output as the error message
            #[serde_as(as = "DisplayFromStr")]
            message: &'a SyncmiruError,

            errors: Option<&'a ValidationErrors>,
        }

        let errors = match &self {
            SyncmiruError::InvalidEntity(errors) => Some(errors),
            _ => None,
        };

        // Normally you wouldn't just print this, but it's useful for debugging without
        // using a logging framework.
        println!("API error: {self:?}");

        (
            self.status_code(),
            Json(ErrorResponse {
                message: &self,
                errors,
            }),
        )
            .into_response()
    }
}

impl SyncmiruError {
    fn status_code(&self) -> StatusCode {
        use SyncmiruError::*;

        match self {
            InvalidEntity(_) | UnprocessableEntity(_) | HCaptchaInvalid(_) => StatusCode::UNPROCESSABLE_ENTITY,
            Conflict(_) => StatusCode::CONFLICT,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}
