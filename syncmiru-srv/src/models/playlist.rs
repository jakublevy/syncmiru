use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use crate::models::query::RoomSettings;
use crate::srvstate::PlaylistEntryId;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum PlaylistEntry {
    Video { source: String, path: String },
    Url { url: String }
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
    pub timestamp: f64,
    pub aid: Option<u64>,
    pub sid: Option<u64>,
    pub audio_sync: bool,
    pub sub_sync: bool,
    pub audio_delay: f64,
    pub sub_delay: f64,
}

#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
pub enum UserReadyStatus {
    Ready, NotReady, Loading, Error
}
