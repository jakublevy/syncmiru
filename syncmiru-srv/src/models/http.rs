use hcaptcha::Hcaptcha;
use validator::Validate;
use crate::validators;
use serde::{Serialize, Deserialize};
use serde_repr::Serialize_repr;


#[derive(Debug, Copy, Clone, Serialize)]
pub struct ServiceStatus {
    pub reg_pub_allowed: bool,
    pub wait_before_resend: i64
}

#[derive(Debug, Clone, Deserialize, Validate, Hcaptcha)]
pub struct RegForm {
    #[validate(custom(function = "validators::check_username_format"))]
    pub username: String,

    #[validate(custom(function = "validators::check_displayname_format"))]
    pub displayname: String,

    #[validate(email, length(max = 320))]
    pub email: String,

    #[validate(length(min = 8))]
    pub password: String,

    #[captcha]
    pub captcha: String,

    pub reg_tkn: String,
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
pub struct EmailWithLang {
    #[validate(email, length(max = 320))]
    pub email: String,

    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct EmailVerify {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    #[validate(range(min = 1))]
    pub uid: i32,

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

    #[validate(length(min = 8))]
    pub password: String,

    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

impl BooleanResp {
    pub fn from(b: bool) -> Self {
        Self { resp: b }
    }
}