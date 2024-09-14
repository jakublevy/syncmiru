use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::models::playlist::UserReadyStatus;
use crate::models::query::Id;
use crate::validators;

#[derive(Debug, Copy, Clone, Deserialize, Validate)]
pub struct UserLoadedInfo {
    #[validate(custom(function = "validators::check_aid_sid"))]
    pub aid: Option<u64>,

    #[validate(custom(function = "validators::check_aid_sid"))]
    pub sid: Option<u64>,

    pub audio_sync: bool,
    pub sub_sync: bool
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserPlayInfoClient {
    pub uid: Id,
    pub status: UserReadyStatus,
    pub aid: Option<u64>,
    pub sid: Option<u64>,
    pub audio_sync: bool,
    pub sub_sync: bool
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserPause {
    pub uid: Id,
    pub timestamp: f64
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserSeek {
    pub uid: Id,
    pub timestamp: f64
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserSpeedChange {
    pub uid: Id,
    pub speed: Decimal
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeAudio {
    pub uid: Id,
    pub aid: Option<u64>
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeSub {
    pub uid: Id,
    pub sid: Option<u64>
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeAudioDelay {
    pub uid: Id,
    pub audio_delay: f64
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeSubDelay {
    pub uid: Id,
    pub sub_delay: f64
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeAudioSync {
    pub uid: Id,
    pub audio_sync: bool
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserChangeSubSync {
    pub uid: Id,
    pub sub_sync: bool
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserUploadMpvState {
    pub uid: Id,
    pub aid: Option<u64>,
    pub sid: Option<u64>,
    pub audio_delay: f64,
    pub sub_delay: f64
}