use sqlx::{PgPool};
use crate::config::Config;

#[derive(Debug, Clone)]
pub struct SrvState {
    pub config: Config,
    pub db: PgPool,
}
