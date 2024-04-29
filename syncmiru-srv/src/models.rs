use serde::Serialize;
use crate::models::query::Id;

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