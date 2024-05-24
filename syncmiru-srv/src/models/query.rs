use chrono::Utc;
use serde::Serialize;

#[derive(sqlx::Type)]
#[sqlx(type_name = "email_reason", rename_all = "snake_case")]
pub enum EmailTknType {
    ForgottenPassword,
    Verify,
    DeleteAccount
}

pub type Id = i32;

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct UserSession {
    pub id: Id,
    pub device_name: String,
    pub os: String,
    pub last_access_at: chrono::DateTime<Utc>
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RegTkn {
    pub id: Id,
    pub name: String,
    pub key: String,
    pub max_reg: Option<i32>
}