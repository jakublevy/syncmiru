use hcaptcha::Hcaptcha;
use validator::Validate;

#[derive(Debug, Clone)]
pub enum ResponseCode {
    Ok,
    Err,
    Yes,
    No,
}

impl serde::Serialize for ResponseCode {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: serde::Serializer,
    {
        match self {
            ResponseCode::Ok => serializer.serialize_i8(0),
            ResponseCode::Err => serializer.serialize_i8(1),
            ResponseCode::Yes => serializer.serialize_i8(2),
            ResponseCode::No => serializer.serialize_i8(3),
        }
    }
}

#[derive(Debug, Copy, Clone, serde::Serialize)]
pub struct ServiceStatus {
    pub reg_pub_allowed: bool
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct RegResponse {
    pub code: ResponseCode,
    pub error_fields: Vec<String>,
}

#[derive(Debug, Clone, serde::Deserialize, Validate, Hcaptcha)]
pub struct RegForm {
    #[validate(custom(function = "crate::validators::check_username_format"))]
    pub username: String,

    #[validate(custom(function = "crate::validators::check_displayname_format"))]
    pub displayname: String,

    #[validate(email, length(max = 320))]
    pub email: String,

    #[validate(length(min = 8))]
    pub password: String,

    #[captcha]
    pub captcha: String,

    pub reg_tkn: String,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct Username {
    pub username: String,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct Email {
    pub email: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct UsernameEmailUniqueResponse {
    pub code: ResponseCode,
}