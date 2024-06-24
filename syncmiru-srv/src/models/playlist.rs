use serde::Serialize;
use crate::srvstate::PlaylistEntryId;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum PlaylistEntry {
    Video { source: String, path: String },
    Url { url: String },
    Subtitles { source: String, path: String },
}

pub struct RoomPlayInfo {
    playing_entry_id: PlaylistEntryId,
    playing_state: PlayingState
}

pub enum PlayingState {
    Play, Pause
}

pub struct UserPlayInfo {
    pub playing_entry_id: PlaylistEntryId,
    pub status: UserStatus,
    pub timestamp: u64,
    pub aid: u64,
    pub sid: u64
}

pub enum UserStatus {
    Ready, NotReady, Loading
}