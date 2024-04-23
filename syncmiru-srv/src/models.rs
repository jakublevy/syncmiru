use serde::Serialize;

pub mod http;
pub mod query;

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct CurrentUser {
    pub username: String,

    #[sqlx(rename = "display_name")]
    pub displayname: String,

    pub avatar: Option<Vec<u8>>
}