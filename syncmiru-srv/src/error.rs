//! This module defines the custom error type `SyncmiruError` used throughout the entire application.

use serde_with::DisplayFromStr;
use std::io;
use std::num::ParseIntError;
use std::sync::PoisonError;
use axum::http::StatusCode;
use axum::Json;
use axum::response::{IntoResponse, Response};
use validator::ValidationErrors;


/// The `SyncmiruError` enum defines all possible error types that the application may encounter.
/// Each variant is associated with a specific error type, and `#[from]` allows automatic conversion
/// from the underlying error type into a `SyncmiruError` instance.
#[derive(thiserror::Error, Debug)]
pub enum SyncmiruError {
    /// IO-related errors
    #[error("Io error occurred")]
    IoError(#[from] io::Error),

    /// Errors related to setting up the logger
    #[error("Logger error")]
    LoggerError(#[from] log::SetLoggerError),

    /// YAML scanning errors (e.g., malformed YAML files)
    #[error("Error while scanning YAML")]
    YamlScanError(#[from] yaml_rust2::ScanError),

    /// Database operation errors from SQLx
    #[error("DB error")]
    SqlxError(#[from] sqlx::error::Error),

    /// Database migration errors from SQLx
    #[error("DB migration error")]
    MigrationError(#[from] sqlx::migrate::MigrateError),

    /// Errors from joining asynchronous tasks in Tokio
    #[error("Join error")]
    JoinError(#[from] tokio::task::JoinError),

    /// Errors related to HCaptcha validation failures
    #[error("HCaptcha invalid")]
    HCaptchaInvalid(#[from] hcaptcha::Error),

    /// Errors when parsing email addresses using Lettre
    #[error("Lettre email address error")]
    LettreAddressError(#[from] lettre::address::AddressError),

    /// Generic Lettre errors
    #[error("Lettre error")]
    LettreError(#[from] lettre::error::Error),

    /// Errors related to SMTP in Lettre
    #[error("Lettre SMTP error")]
    LettreSmtpError(#[from] lettre::transport::smtp::Error),

    /// General internal errors wrapped in `anyhow::Error`
    #[error("Internal error")]
    InternalError(#[from] anyhow::Error),

    /// Validation errors in request bodies
    #[error("Validation error in request body")]
    InvalidEntity(#[from] ValidationErrors),

    /// Errors related to URL encoding serialization
    #[error("URL encoding error")]
    SerdeUrlSerError(#[from] serde_urlencoded::ser::Error),

    /// Errors from parsing PEM files
    #[error("PEM parsing error")]
    PemError(#[from] pem::PemError),

    /// Errors from the OpenSSL error stack
    #[error("openssl error stack")]
    ErrorStack(#[from] openssl::error::ErrorStack),

    /// Errors related to JWT processing
    #[error("jwt error")]
    JoseError(#[from] josekit::JoseError),

    /// Errors when sending messages via Socket.IO
    #[error("Socket.IO send error")]
    SocketIoSendError(#[from] socketioxide::SendError),

    /// Errors when disconnecting a Socket.IO client
    #[error("Socket.IO disconnect error")]
    SocketIoDisconnectError(#[from] socketioxide::DisconnectError),

    /// Errors from parsing integers
    #[error("int parse failed")]
    ParseIntError(#[from] ParseIntError),

    /// Errors from HTTP requests using Reqwest
    #[error("Reqwest error")]
    ReqwestError(#[from] reqwest::Error),

    /// Errors from JSON serialization or deserialization using Serde
    #[error("Serde JSON error")]
    SerdeJsonError(#[from] serde_json::error::Error),

    /// Errors when parsing CLI arguments
    #[error("Parsing CLI args failed {0}")]
    CliParseFailed(String),

    /// Errors for invalid YAML structures
    #[error("Yaml invalid {0}")]
    YamlInvalid(String),

    /// HTTP Unprocessable entity errors
    #[error("Unprocessable entity")]
    UnprocessableEntity(String),

    /// HTTP Conflict errors
    #[error("Conflict")]
    Conflict(String),

    /// Authentication-related errors
    #[error("Auth error")]
    AuthError,

    /// Errors when an email is not verified
    #[error("Email not verified")]
    EmailNotVerified,

    /// Errors while parsing JWT keys
    #[error("JWT key parse error")]
    JwtKeyParseError(String),

    /// Errors when parsing YAML arrays
    #[error("YAML array parse error")]
    YAMLArrayParseError(String),

    /// Synchronization-related errors (e.g., poisoned locks)
    #[error("Poison error")]
    PoisonError
}

/// Converts a `PoisonError` into a `SyncmiruError::PoisonError`.
impl<T> From<PoisonError<T>> for SyncmiruError {
    fn from(_: PoisonError<T>) -> Self {
        Self::PoisonError
    }
}



impl IntoResponse for SyncmiruError {
    /// Converts `SyncmiruError` into an HTTP response, including appropriate status codes and error details.
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
    /// Maps `SyncmiruError` variants to appropriate HTTP status codes.
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
