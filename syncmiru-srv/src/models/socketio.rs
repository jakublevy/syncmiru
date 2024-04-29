use chrono::Utc;
use serde::{Serialize, Deserialize};
use validator::Validate;
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