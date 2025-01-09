//! This module contains data structures used in HTTP handlers.

use validator::Validate;
use crate::validators;
use serde::{Serialize, Deserialize};
use crate::models::query::Id;


/// Represents the service status.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct ServiceStatus {
    /// Indicates whether public registration is allowed
    pub reg_pub_allowed: bool,

    /// The wait time (in seconds) before resending tokens is allowed
    pub wait_before_resend: i64
}


/// Represents the registration form submitted by users.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RegForm {
    /// The username selected by the user
    #[validate(custom(function = "validators::check_username_format"))]
    pub username: String,

    /// The display name chosen by the user
    #[validate(custom(function = "validators::check_displayname_format"))]
    pub displayname: String,

    /// The user's email address
    #[validate(email, length(max = 320))]
    pub email: String,

    /// The user's chosen password
    #[validate(custom(function = "validators::check_password_format"))]
    pub password: String,

    /// A captcha token
    pub captcha: String,

    /// An optional registration token
    #[validate(custom(function = "validators::check_tkn"))]
    pub reg_tkn: Option<String>,
}


/// Represents a structure containing a single username.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Username {
    /// The username to validate
    #[validate(custom(function = "validators::check_username_format"))]
    pub username: String,
}


/// Represents a structure containing a single email.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Email {
    /// The email to validate
    #[validate(email, length(max = 320))]
    pub email: String,
}


/// Represents a request to verify an email.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct EmailVerify {
    /// A verification token
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    /// The user ID
    #[validate(range(min = 1))]
    pub uid: Id,

    /// The user's language
    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}


/// Represents a simple boolean response.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct BooleanResp {
    /// The boolean response value
    pub resp: bool,
}


/// Represents a token and email combination.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct TknEmail {
    /// A token
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    /// An email address
    #[validate(email, length(max = 320))]
    pub email: String
}


/// Represents a request to change a forgotten password.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct ForgottenPasswordChange {
    /// A verification token
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    /// The user's email address
    #[validate(email, length(max = 320))]
    pub email: String,

    /// The new password
    #[validate(custom(function = "validators::check_password_format"))]
    pub password: String,

    /// The user's language
    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}


/// Represents a login request.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Login {
    /// The user's email address
    #[validate(email, length(max = 320))]
    pub email: String,

    /// The user's password
    #[validate(custom(function = "validators::check_password_format"))]
    pub password: String,

    /// The operating system of the user's device
    #[validate(length(min = 3))]
    pub os: String,

    /// The name of the user's device
    #[validate(length(min = 1))]
    pub device_name: String,

    /// A hardware identifier hash of the user's device
    #[validate(length(equal = 64))]
    pub hwid_hash: String
}

/// Represents a JWT.
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct Jwt {
    /// The JWT string
    #[validate(length(min = 1))]
    pub jwt: String
}

impl BooleanResp {
    /// Creates a new `BooleanResp` from a boolean value.
    ///
    /// # Arguments
    /// * `b` (`bool`): The boolean value.
    ///
    /// # Returns
    /// * `BooleanResp`: A new `BooleanResp` instance with the given value.
    pub fn from(b: bool) -> Self {
        Self { resp: b }
    }
}