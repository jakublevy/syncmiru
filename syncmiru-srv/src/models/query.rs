//! This module defines models used for database queries.

use chrono::Utc;
use rust_decimal::Decimal;
use serde::Serialize;


/// Represents the types of email tokens used for various actions.
#[derive(sqlx::Type)]
#[sqlx(type_name = "email_reason", rename_all = "snake_case")]
pub enum EmailTknType {
    /// Token used for password recovery
    ForgottenPassword,

    /// Token used for verifying an account
    Verify,

    /// Token used for deleting an account
    DeleteAccount
}

/// Represents a unique identifier used across models.
pub type Id = i32;


/// Represents a user session with details about the device and access times.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct UserSession {
    /// The unique identifier for the session
    pub id: Id,

    /// The name of the device used for the session
    pub device_name: String,

    /// The operating system of the device used for the session
    pub os: String,

    /// The timestamp of the last access for the session
    pub last_access_at: chrono::DateTime<Utc>
}


/// Represents a registration token used for creating new user accounts.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RegTkn {
    /// The unique identifier for the registration token
    pub id: Id,

    /// The name of the token
    pub name: String,

    /// The key value of the token used for validation
    pub key: String,

    /// The maximum number of registrations allowed using this token. This value is optional
    pub max_reg: Option<i32>,

    /// The number of times this token has been used
    pub used: i32
}


/// Represents registration details for a user.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RegDetail {
    /// The timestamp of when the registration occurred
    reg_at: chrono::DateTime<Utc>,

    /// The unique identifier of the user associated with the registration
    #[sqlx(rename = "id")]
    uid: Id
}


/// Represents the settings for a room.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RoomSettings {
    /// The playback speed for the room
    pub playback_speed: Decimal,

    /// The maximum allowed desynchronization tolerance for playback
    pub desync_tolerance: Decimal,

    /// The playback slowdown factor for minor desynchronization
    pub minor_desync_playback_slow: Decimal,

    /// The minimum threshold for major desynchronization
    pub major_desync_min: Decimal
}

/// Represents information about room for clients.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RoomClient {
    /// The room identification
    pub id: Id,

    /// The room name
    pub name: String
}


/// Represents a collection of rooms for clients with their display order.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct RoomsClientWOrder {
    /// A list of rooms represented as `RoomClient` objects
    pub rooms: Vec<RoomClient>,

    /// The order in which the rooms should be displayed, represented by their IDs
    pub room_order: Vec<Id>
}