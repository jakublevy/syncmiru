use chrono::Utc;
use rust_decimal::Decimal;
use serde::{Serialize, Deserialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use validator::Validate;
use crate::validators;
use crate::models::query::Id;

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct LoginTkns {
    #[validate(length(equal = 64))]
    pub hwid_hash: String,

    #[validate(length(min = 1))]
    pub jwt: String
}

#[derive(Debug, Copy, Clone, Deserialize, Validate)]
pub struct IdStruct {
    #[validate(range(min = 1))]
    pub id: Id
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Displayname {
    #[validate(custom(function = "validators::check_displayname_format"))]
    pub displayname: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct DisplaynameChange {
    pub uid: Id,
    pub displayname: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct EmailChangeTkn {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,
    pub tkn_type: EmailChangeTknType
}

#[derive(Debug, Copy, Clone, PartialEq, Deserialize_repr)]
#[repr(u8)]
pub enum EmailChangeTknType {
    From = 0,
    To = 1
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct ChangeEmail {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn_from: String,

    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn_to: String,

    #[validate(email, length(max = 320))]
    pub email_new: String,

    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct AvatarBin {
    #[validate(custom(function = "validators::check_avatar"))]
    pub data: Vec<u8>
}

#[derive(Debug, Clone, Serialize)]
pub struct AvatarChange {
    pub uid: Id,
    pub avatar: Vec<u8>
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Password {
    #[validate(custom(function = "validators::check_password_format"))]
    pub password: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct ChangePassword {
    #[validate(custom(function = "validators::check_password_format"))]
    pub old_password: String,

    #[validate(custom(function = "validators::check_password_format"))]
    pub new_password: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Language {
    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct TknWithLang {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RegTknCreate {
    #[validate(custom(function = "validators::check_reg_tkn_name"))]
    pub reg_tkn_name: String,

    #[validate(custom(function = "validators::check_reg_tkn_max_regs"))]
    pub max_regs: Option<i32>
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RegTknName {
    #[validate(custom(function = "validators::check_reg_tkn_name"))]
    pub reg_tkn_name: String,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct PlaybackSpeed {
    #[validate(custom(function = "validators::check_playback_speed"))]
    pub playback_speed: Decimal
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct DesyncTolerance {
    #[validate(custom(function = "validators::check_desync_tolerance"))]
    pub desync_tolerance: Decimal
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct MajorDesyncMin {
    #[validate(custom(function = "validators::check_major_desync_min"))]
    pub major_desync_min: Decimal
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct MinorDesyncPlaybackChange {
    #[validate(custom(function = "validators::check_minor_desync_playback_change"))]
    pub minor_desync_playback_change: Decimal
}

#[serde_with::serde_as]
#[serde_with::skip_serializing_none]
#[derive(Debug, Clone, serde::Serialize)]
pub struct SocketIoAck<T: Serialize> {
    status: SocketIoAckType,
    payload: Option<T>
}

impl<T: Serialize + Clone> SocketIoAck<T> {
    pub fn ok(payload: Option<T>) -> Self {
        Self { status: SocketIoAckType::Ok, payload: payload.map(|x| x.clone()) }
    }
    pub fn err() -> Self {
        Self { status: SocketIoAckType::Err, payload: None }
    }
}

#[derive(Debug, Clone, Serialize_repr)]
#[repr(u8)]
pub enum SocketIoAckType {
    Ok = 0,
    Err = 1
}