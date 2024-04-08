use log::{debug, info};
use sqlx::{Pool, Postgres};
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use crate::config::DbConfig;
use crate::result::Result;
use sqlx::PgPool;

pub async fn create_connection_pool(db_config: &DbConfig) -> Result<PgPool> {
    let opts = PgConnectOptions::new()
        .host(&db_config.host)
        .application_name("syncmiru-srv")
        .username(&db_config.user)
        .password(&db_config.password)
        .port(db_config.port)
        .database(&db_config.name);

    debug!("Connecting to DB");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect_with(opts).await?;

    info!("Connected to DB");
    Ok(pool)
}

pub async fn run_migrations(db: &PgPool) -> Result<()> {
    debug!("Migrations starting");
    sqlx::migrate!().run(db).await?;
    info!("Migrations finished");
    Ok(())
}