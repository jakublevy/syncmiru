use serde::{Deserialize, Serialize};
use validator::Validate;

pub mod http;
pub mod query;
pub mod ws;

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct Jwt {
    #[validate(length(min = 1))]
    pub jwt: String
}

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct MyProfile {
    pub username: String,
    pub display_name: String,
    pub email: String,
    pub avatar: Option<Vec<u8>>
}