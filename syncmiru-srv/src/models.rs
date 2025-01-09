//! This module defines the core data structures (models) used across the application for handling HTTP and Socket.IO requests and responses.

use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::models::query::Id;
use crate::validators;

pub mod http;
pub mod query;
pub mod socketio;
pub mod file;
pub mod mpv;


/// Represents a user in the system.
#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct User {
    /// The id of the user.
    pub id: Id,

    /// The user's unique username used for login
    pub username: String,

    /// The user's display name shown in the application
    #[sqlx(rename = "display_name")]
    pub displayname: String,

    /// An optional avatar image represented as a binary blob
    pub avatar: Option<Vec<u8>>,

    /// A flag indicating whether the user's account has been verified
    pub verified: bool
}


/// Represents an email address and language preference submitted by a user.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct EmailWithLang {
    /// The user's email address
    #[validate(email, length(max = 320))]
    pub email: String,

    /// The user's language preference
    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}


/// Represents a token used for authentication or verification purposes.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Tkn {
    /// The token value
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,
}