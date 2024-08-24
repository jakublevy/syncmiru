use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::models::playlist::UserStatus;
use crate::models::query::Id;

#[derive(Debug, Copy, Clone, Deserialize, Validate)]
pub struct UserLoadedInfo {
    #[validate(range(min = 1))]
    pub aid: u64,

    #[validate(range(min = 1))]
    pub sid: u64,

    pub audio_sync: bool,
    pub sub_sync: bool
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserPlayInfoClient {
    pub uid: Id,
    pub status: UserStatus,
    pub aid: u64,
    pub sid: u64,
    pub audio_sync: bool,
    pub sub_sync: bool
}