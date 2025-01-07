//! This module defines the custom error type `SyncmiruError` used throughout the entire application.

use std::io;
use std::num::ParseIntError;
use std::str::ParseBoolError;
use std::sync::PoisonError;
use crate::mpv::ipc::Interface;


/// The `SyncmiruError` enum defines all possible error types that the application may encounter.
/// Each variant is associated with a specific error type, and `#[from]` allows automatic conversion
/// from the underlying error type into a `SyncmiruError` instance.
#[derive(thiserror::Error, Debug)]
pub enum SyncmiruError {

    /// Error when processing INI files
    #[error("Error while processing ini file")]
    IniError(#[from] ini::Error),

    /// Error when interacting with the system keyring
    #[error("Error while using keyring")]
    KeyringError(#[from] keyring::error::Error),

    /// Generic IO error
    #[error("Io error")]
    IoError(#[from] io::Error),

    /// Error related to Tauri framework
    #[error("Tauri error")]
    TauriError(#[from] tauri::Error),

    /// Internal error within the application, typically wrapping an `anyhow::Error`
    #[error("Internal error")]
    InternalError(#[from] anyhow::Error),

    /// Error related to HTTP requests made using `reqwest` library
    #[error("Reqwest error")]
    ReqwestError(#[from] reqwest::Error),

    /// Error related to XML parsing via `roxmltree`
    #[error("XML error")]
    XmlError(#[from] roxmltree::Error),

    /// Error when decompressing 7z files
    #[error("7z extract failed")]
    SevenzError(#[from] sevenz_rust::Error),

    /// Error when decompressing ZIP files
    #[error("Zip error")]
    ZipError(#[from] zip::result::ZipError),

    /// Error from the GitHub API via `octocrab`
    #[error("Github API error")]
    OctocrabError(#[from] octocrab::Error),

    /// Error from Serde JSON serialization/deserialization
    #[error("Serde JSON error")]
    SerdeJsonError(#[from] serde_json::Error),

    /// Windows-specific error related to WinAPI
    #[cfg(target_family = "windows")]
    #[error("WinApi error")]
    WinApiError(#[from] windows::core::Error),

    /// Error when connecting to the X11 server on Unix systems
    #[cfg(target_family = "unix")]
    #[error("X11rb connect error")]
    X11rbConnectError(#[from] x11rb::errors::ConnectError),

    /// General connection error with X11 server on Unix systems
    #[cfg(target_family = "unix")]
    #[error("X11rb connection error")]
    X11rbConnectionError(#[from] x11rb::errors::ConnectionError),

    /// Error when receiving replies from the X11 server on Unix systems
    #[cfg(target_family = "unix")]
    #[error("X11rb reply error")]
    X11rbReplyError(#[from] x11rb::errors::ReplyError),

    /// Error related to X11 reply or ID issues on Unix systems
    #[cfg(target_family = "unix")]
    #[error("X11rb reply or id error")]
    X11rbReplyOrIdError(#[from] x11rb::errors::ReplyOrIdError),

    /// Error when sending messages through the MPSC (multi-producer, single-consumer) channel
    /// related to the MPV interface.
    #[error("Mpsc mpv interface send error")]
    MpscMpvInterfaceSendError(#[from] tokio::sync::mpsc::error::SendError<Interface>),

    /// Error when sending `serde_json::Value` through the MPSC channel
    #[error("Mpsc serde_json::Value send error")]
    MpscSerdeJsonValueSendError(#[from] tokio::sync::mpsc::error::SendError<serde_json::Value>),

    /// Error when receiving a void result from a oneshot channel
    #[error("Oneshot void recv error")]
    OneshotVoidRecvError(#[from] tokio::sync::oneshot::error::RecvError),

    /// Error when sending a void result through an MPSC channel
    #[error("Mpsc void send error")]
    MpscVoidSendError(#[from] tokio::sync::mpsc::error::SendError<()>),

    /// Error from parsing a boolean value
    #[error("ParseBoolError")]
    ParseBoolError(#[from] ParseBoolError),

    /// An error representing an operation that doesn't return a value
    #[error("Void error")]
    VoidError(),

    /// Error when working with the `rust_decimal` crate
    #[error("Rust Decimal error")]
    RustDecimalError(#[from] rust_decimal::Error),

    /// Error when parsing an integer value
    #[error("Parse int error")]
    ParseIntError(#[from] ParseIntError),

    /// Error when attempting to obtain a property from MPV (media player)
    #[error("Mpv obtaining property failed")]
    MpvReceiveResponseError,

    /// Error indicating that the URL is missing a version parameter
    #[error("URL missing version error")]
    LatestVersionMissingError,

    /// Error during the download of dependencies
    #[error("Deps download failed")]
    DepsDownloadFailed,

    /// Error indicating that the MPV IPC interface is not running
    #[error("Mpv IPC not running")]
    MpvIpcNotRunning,

    /// Error caused by a poisoned lock (usually in a `Mutex` or `RwLock`)
    #[error("Poison error")]
    PoisonError,
}

/// Converts a `PoisonError` into a `SyncmiruError::PoisonError`.
impl<T> From<PoisonError<T>> for SyncmiruError {
    fn from(_: PoisonError<T>) -> Self {
        Self::PoisonError
    }
}

/// Converts a unit type (`()`) into a `SyncmiruError::VoidError`.
impl From<()> for SyncmiruError {
    fn from(_: ()) -> Self {
        Self::VoidError()
    }
}

/// Converts a boolean value into a `SyncmiruError::VoidError`.
impl From<bool> for SyncmiruError {
    fn from(_: bool) -> Self {
        Self::VoidError()
    }
}

/// Custom serialization for `SyncmiruError` to include detailed error messages.
impl serde::Serialize for SyncmiruError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::ser::Serializer,
    {
        let mut errors: Option<String> = None;
        if let SyncmiruError::ReqwestError(e) = &self {
            errors = Some(e.to_string());
        } else if let SyncmiruError::InternalError(e) = &self {
            errors = Some(e.to_string());
        }
        let out = format!("{} {}", self.to_string(), errors.unwrap_or("".to_string()));
        serializer.serialize_str(&out)
    }
}
