use chrono::Utc;
use serde::{Serialize, Deserialize};
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

#[derive(Debug, Copy, Clone, Serialize)]
pub enum SocketIoAckType {
    Ok,
    Err
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct SocketIoAck {
    pub resp: SocketIoAckType
}

impl SocketIoAck {
    pub fn ok() -> Self {
        Self { resp: SocketIoAckType::Ok }
    }
    pub fn err() -> Self {
        Self { resp: SocketIoAckType::Err }
    }
}