use serde_with::DisplayFromStr;
use std::io;
use std::str::ParseBoolError;
use std::sync::PoisonError;
use crate::mpv::ipc::Interface;

#[derive(thiserror::Error, Debug)]
pub enum SyncmiruError {

    #[error("Error while processing ini file")]
    IniError(#[from] ini::Error),

    #[error("Error while using keyring")]
    KeyringError(#[from] keyring::error::Error),

    #[error("Io error")]
    IoError(#[from] io::Error),

    #[error("Tauri error")]
    TauriError(#[from] tauri::Error),

    #[error("Internal error")]
    InternalError(#[from] anyhow::Error),

    #[error("Reqwest error")]
    ReqwestError(#[from] reqwest::Error),

    #[error("XML error")]
    XmlError(#[from] roxmltree::Error),

    #[error("7z extract failed")]
    SevenzError(#[from] sevenz_rust::Error),

    #[error("Zip error")]
    ZipError(#[from] zip::result::ZipError),

    #[error("Github API error")]
    OctocrabError(#[from] octocrab::Error),

    #[error("Serde JSON error")]
    SerdeJsonError(#[from] serde_json::Error),

    #[cfg(target_family = "windows")]
    #[error("WinApi error")]
    WinApiError(#[from] windows::core::Error),

    #[cfg(target_family = "unix")]
    #[error("X11rb connect error")]
    X11rbConnectError(#[from] x11rb::errors::ConnectError),

    #[cfg(target_family = "unix")]
    #[error("X11rb connection error")]
    X11rbConnectionError(#[from] x11rb::errors::ConnectionError),

    #[cfg(target_family = "unix")]
    #[error("X11rb reply error")]
    X11rbReplyError(#[from] x11rb::errors::ReplyError),

    #[cfg(target_family = "unix")]
    #[error("X11rb reply or id error")]
    X11rbReplyOrIdError(#[from] x11rb::errors::ReplyOrIdError),

    #[error("Mpsc mpv interface send error")]
    MpscMpvInterfaceSendError(#[from] tokio::sync::mpsc::error::SendError<Interface>),

    #[error("Mpsc serde_json::Value send error")]
    MpscSerdeJsonValueSendError(#[from] tokio::sync::mpsc::error::SendError<serde_json::Value>),

    #[error("Mpsc void send error")]
    MpscVoidSendError(#[from] tokio::sync::mpsc::error::SendError<()>),

    #[error("ParseBoolError")]
    ParseBoolError(#[from] ParseBoolError),

    #[error("URL missing version error")]
    LatestVersionMissingError,

    #[error("Deps download failed")]
    DepsDownloadFailed,

    #[error("Poison error")]
    PoisonError
}

impl<T> From<PoisonError<T>> for SyncmiruError {
    fn from(_: PoisonError<T>) -> Self {
        Self::PoisonError
    }
}

impl serde::Serialize for SyncmiruError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::ser::Serializer,
    {
        #[serde_with::serde_as]
        #[serde_with::skip_serializing_none]
        #[derive(serde::Serialize, Debug)]
        struct ErrorResponse<'a> {
            #[serde_as(as = "DisplayFromStr")]
            message: &'a SyncmiruError,

            desc: Option<String>,
        }

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
