//! This module provides functionality for interacting with the PostgreSQL database.

use log::{debug, info};
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use crate::config::DbConfig;
use crate::result::Result;
use sqlx::PgPool;
use crate::constants;


/// Creates a PostgreSQL database connection pool using the provided configuration.
///
/// # Arguments
/// - `db_config`: The configuration object containing database connection details.
///
/// # Returns
/// - `Result<PgPool>`: The result contains either the PostgreSQL connection pool (`PgPool`) on success
///   or an error if the connection could not be established.
pub async fn create_connection_pool(db_config: &DbConfig) -> Result<PgPool> {
    let opts = PgConnectOptions::new()
        .host(&db_config.host)
        .application_name(constants::APP_NAME)
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


/// Runs the database migrations on the provided PostgreSQL connection pool.
///
/// This function ensures that any pending migrations are applied to the database. It uses
/// `sqlx::migrate!()` to apply migrations found in the project.
///
/// # Arguments
/// - `db`: The PostgreSQL connection pool (`PgPool`) used for running the migrations.
///
/// # Returns
/// - `Result<()>`: The result indicates whether the migration was successful or if an error occurred.
pub async fn run_migrations(db: &PgPool) -> Result<()> {
    debug!("Migrations starting");
    sqlx::migrate!().run(db).await?;
    info!("Migrations finished");
    Ok(())
}