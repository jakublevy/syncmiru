use serde::{Deserialize, Serialize};
use validator::Validate;
use crate::models::query::Id;
use crate::validators;

pub mod http;
pub mod query;
pub mod socketio;

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct User {
    pub id: Id,

    pub username: String,

    #[sqlx(rename = "display_name")]
    pub displayname: String,

    pub avatar: Option<Vec<u8>>
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct EmailWithLang {
    #[validate(email, length(max = 320))]
    pub email: String,

    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}