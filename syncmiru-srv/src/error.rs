use serde_with::DisplayFromStr;
use std::io;
use std::num::ParseIntError;
use std::sync::PoisonError;
use axum::http::StatusCode;
use axum::Json;
use axum::response::{IntoResponse, Response};
use validator::ValidationErrors;

#[derive(thiserror::Error, Debug)]
pub enum SyncmiruError {
    #[error("Io error occurred")]
    IoError(#[from] io::Error),

    #[error("Logger error")]
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
    HCaptchaInvalid(#[from] hcaptcha::Error),

    #[error("Lettre email address error")]
    LettreAddressError(#[from] lettre::address::AddressError),

    #[error("Lettre error")]
    LettreError(#[from] lettre::error::Error),

    #[error("Lettre SMTP error")]
    LettreSmtpError(#[from] lettre::transport::smtp::Error),

    #[error("Internal error")]
    InternalError(#[from] anyhow::Error),

    #[error("Validation error in request body")]
    InvalidEntity(#[from] ValidationErrors),

    #[error("URL encoding error")]
    SerdeUrlSerError(#[from] serde_urlencoded::ser::Error),

    #[error("PEM parsing error")]
    PemError(#[from] pem::PemError),

    #[error("openssl error stack")]
    ErrorStack(#[from] openssl::error::ErrorStack),

    #[error("jwt error")]
    JoseError(#[from] josekit::JoseError),

    #[error("socketio send error")]
    SocketIoSendUnitError(#[from] socketioxide::SendError),

    #[error("socketio disconnect error")]
    SocketIoDisconnectError(#[from] socketioxide::DisconnectError),

    #[error("int parse failed")]
    ParseIntError(#[from] ParseIntError),

    #[error("Reqwest error")]
    ReqwestError(#[from] reqwest::Error),

    #[error("Serde JSON error")]
    SerdeJsonError(#[from] serde_json::error::Error),

    #[error("Parsing CLI args failed {0}")]
    CliParseFailed(String),

    #[error("Yaml invalid {0}")]
    YamlInvalid(String),

    #[error("Unprocessable entity")]
    UnprocessableEntity(String),

    #[error("Conflict")]
    Conflict(String),

    #[error("Auth error")]
    AuthError,

    #[error("Email not verified")]
    EmailNotVerified,

    #[error("JWT key parse error")]
    JwtKeyParseError(String),

    #[error("YAML array parse error")]
    YAMLArrayParseError(String),

    #[error("Poison error")]
    PoisonError
}

impl<T> From<PoisonError<T>> for SyncmiruError {
    fn from(_: PoisonError<T>) -> Self {
        Self::PoisonError
    }
}



impl IntoResponse for SyncmiruError {
    fn into_response(self) -> Response {
        #[serde_with::serde_as]
        #[serde_with::skip_serializing_none]
        #[derive(serde::Serialize)]
        struct ErrorResponse<'a> {
            #[serde_as(as = "DisplayFromStr")]
            message: &'a SyncmiruError,

            desc: Option<String>,
        }

        let mut errors: Option<String> = None;
        if let SyncmiruError::InvalidEntity(e) = &self {
            errors = Some(e.to_string())
        }
        else if let SyncmiruError::InternalError(e) = &self {
            errors = Some(e.to_string())
        }
        errors = match &self {
            SyncmiruError::UnprocessableEntity(e)
            | SyncmiruError::Conflict(e)
            => Some(e.to_string()),
            _ => None
        };

        (
            self.status_code(),
            Json(ErrorResponse {
                message: &self,
                desc: errors,
            }),
        )
            .into_response()
    }
}

impl SyncmiruError {
    fn status_code(&self) -> StatusCode {
        use SyncmiruError::*;

        match self {
            InvalidEntity(_) | UnprocessableEntity(_) | HCaptchaInvalid(_) | EmailNotVerified => StatusCode::UNPROCESSABLE_ENTITY,
            Conflict(_) => StatusCode::CONFLICT,
            AuthError => StatusCode::UNAUTHORIZED,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}
