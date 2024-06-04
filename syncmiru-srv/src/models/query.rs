use chrono::Utc;
use rust_decimal::Decimal;
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
    pub max_reg: Option<i32>,
    pub used: i32
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RegDetail {
    reg_at: chrono::DateTime<Utc>,

    #[sqlx(rename = "id")]
    uid: Id
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RoomSettings {
    pub playback_speed: Decimal,
    pub desync_tolerance: Decimal,
    pub minor_desync_playback_slow: Decimal,
    pub major_desync_min: Decimal
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RoomClient {
    pub id: Id,
    pub name: String
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RoomsClientWOrder {
    pub rooms: Vec<RoomClient>,
    pub room_order: Vec<Id>
}