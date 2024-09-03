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