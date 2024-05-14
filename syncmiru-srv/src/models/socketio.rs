use chrono::Utc;
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

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct UserSession {
    pub id: Id,
    pub device_name: String,
    pub os: String,
    pub last_access_at: chrono::DateTime<Utc>
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
    #[validate(length(min = 8))]
    pub password: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct ChangePassword {
    #[validate(length(min = 8))]
    pub old_password: String,

    #[validate(length(min = 8))]
    pub new_password: String
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