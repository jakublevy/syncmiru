use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use crate::models::query::RoomSettings;
use crate::srvstate::PlaylistEntryId;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum PlaylistEntry {
    Video { source: String, path: String },
    Url { url: String },
    Subtitles { source: String, path: String, video_id: PlaylistEntryId },
}


#[derive(Debug)]
pub struct RoomPlayInfo {
    pub playing_entry_id: PlaylistEntryId,
    pub playing_state: PlayingState,
}

#[derive(Debug)]
pub struct RoomRuntimeState {
    pub playback_speed: Decimal,
    pub runtime_config: RoomSettings,
}

#[derive(Debug)]
pub enum PlayingState {
    Play, Pause
}

#[derive(Debug, Copy, Clone)]
pub struct UserPlayInfo {
    pub status: UserStatus,
    pub timestamp: f64,
    pub aid: u64,
    pub sid: u64,
    pub audio_sync: bool,
    pub sub_sync: bool
}

#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
pub enum UserStatus {
    Ready, NotReady
}

#[derive(Debug, Copy, Clone, Serialize)]
pub enum ClientUserStatus {
    Ready, NotReady, Loading
}

impl From<UserStatus> for ClientUserStatus {
    fn from(value: UserStatus) -> Self {
        match value {
            UserStatus::Ready => ClientUserStatus::Ready,
            UserStatus::NotReady => ClientUserStatus::NotReady
        }
    }
}