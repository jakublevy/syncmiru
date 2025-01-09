use validator::Validate;
use crate::validators;
use serde::{Serialize, Deserialize};
use crate::models::query::Id;


#[derive(Debug, Copy, Clone, Serialize)]
pub struct ServiceStatus {
    pub reg_pub_allowed: bool,
    pub wait_before_resend: i64
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RegForm {
    #[validate(custom(function = "validators::check_username_format"))]
    pub username: String,

    #[validate(custom(function = "validators::check_displayname_format"))]
    pub displayname: String,

    #[validate(email, length(max = 320))]
    pub email: String,

    #[validate(custom(function = "validators::check_password_format"))]
    pub password: String,

    /// A captcha token
    pub captcha: String,

    #[validate(custom(function = "validators::check_tkn"))]
    pub reg_tkn: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Username {
    #[validate(custom(function = "validators::check_username_format"))]
    pub username: String,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Email {
    #[validate(email, length(max = 320))]
    pub email: String,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct EmailVerify {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    #[validate(range(min = 1))]
    pub uid: Id,

    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct BooleanResp {
    pub resp: bool,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct TknEmail {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    #[validate(email, length(max = 320))]
    pub email: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct ForgottenPasswordChange {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    #[validate(email, length(max = 320))]
    pub email: String,

    #[validate(custom(function = "validators::check_password_format"))]
    pub password: String,

    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Login {
    #[validate(email, length(max = 320))]
    pub email: String,

    #[validate(custom(function = "validators::check_password_format"))]
    pub password: String,

    #[validate(length(min = 3))]
    pub os: String,

    #[validate(length(min = 1))]
    pub device_name: String,

    #[validate(length(equal = 64))]
    pub hwid_hash: String
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct Jwt {
    #[validate(length(min = 1))]
    pub jwt: String
}

impl BooleanResp {
    pub fn from(b: bool) -> Self {
        Self { resp: b }
    }
}