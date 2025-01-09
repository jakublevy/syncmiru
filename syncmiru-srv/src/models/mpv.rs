//! This module defines data structures used in the context of interacting with mpv.


use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::models::query::Id;
use crate::srvstate::UserReadyStatus;
use crate::validators;


/// Represents information about the user's loaded media state.
#[derive(Debug, Copy, Clone, Deserialize, Validate)]
pub struct UserLoadedInfo {
    /// The audio track ID
    #[validate(custom(function = "validators::check_aid_sid"))]
    pub aid: Option<u64>,

    /// The subtitle track ID
    #[validate(custom(function = "validators::check_aid_sid"))]
    pub sid: Option<u64>,

    /// Indicates whether audio is synchronized
    pub audio_sync: bool,

    /// Indicates whether subtitles are synchronized
    pub sub_sync: bool
}


/// Represents playback information about a user.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserPlayInfoClient {
    /// The user ID
    pub uid: Id,

    /// The user's ready status
    pub status: UserReadyStatus,

    /// The audio track ID
    pub aid: Option<u64>,

    /// The subtitle track ID
    pub sid: Option<u64>,

    /// Indicates whether audio is synchronized
    pub audio_sync: bool,

    /// Indicates whether subtitles are synchronized
    pub sub_sync: bool,

    /// The audio delay in seconds
    pub audio_delay: f64,

    /// The subtitle delay in seconds
    pub sub_delay: f64,
}


/// Represents a user pause action in mpv.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserPause {
    /// The user ID
    pub uid: Id,

    /// The timestamp (in seconds) at which the pause occurred
    pub timestamp: f64
}


/// Represents a user seek action in mpv.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserSeek {
    /// The user ID
    pub uid: Id,

    /// The target timestamp (in seconds) to seek to
    pub timestamp: f64
}


/// Represents a user speed change action in mpv.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserSpeedChange {
    /// The user ID
    pub uid: Id,

    /// The new playback speed as a decimal value
    pub speed: Decimal
}


/// Represents a user action to change the audio track.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeAudio {
    /// The user ID
    pub uid: Id,

    /// The new audio track ID
    pub aid: Option<u64>
}


/// Represents a user action to change the subtitle track.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeSub {
    /// The user ID
    pub uid: Id,

    /// The new subtitle track ID
    pub sid: Option<u64>
}


/// Represents a user action to change the audio delay.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeAudioDelay {
    /// The user ID
    pub uid: Id,

    /// The new audio delay in seconds
    pub audio_delay: f64
}


/// Represents a user action to change the subtitle delay.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeSubDelay {
    /// The user ID
    pub uid: Id,

    /// The new subtitle delay in seconds
    pub sub_delay: f64
}


/// Represents a user action to toggle audio synchronization.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeAudioSync {
    /// The user ID
    pub uid: Id,

    /// The new audio sync state (`true` for enabled, `false` for disabled)
    pub audio_sync: bool
}


/// Represents a user action to toggle subtitle synchronization.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeSubSync {
    /// The user ID
    pub uid: Id,

    /// The new subtitle sync state (`true` for enabled, `false` for disabled)
    pub sub_sync: bool
}


/// Represents a user's upload of the current MPV state.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserUploadMpvState {
    /// The user ID
    pub uid: Id,

    /// The audio track ID
    pub aid: Option<u64>,

    /// The subtitle track ID
    pub sid: Option<u64>,

    /// The current audio delay in seconds
    pub audio_delay: f64,

    /// The current subtitle delay in seconds
    pub sub_delay: f64
}