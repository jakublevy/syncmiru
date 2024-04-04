use sqlx::{PgPool};
use crate::config::Config;

#[derive(Debug, Clone)]
pub struct SrvState {
    pub config: Config,
    pub db: PgPool,
}


#[derive(Debug, Copy, Clone, serde::Serialize)]
pub struct WebState {
    pub reg_pub_allowed: bool
}