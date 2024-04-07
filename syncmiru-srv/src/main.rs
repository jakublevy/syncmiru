use std::env::set_var;
use std::net::SocketAddr;
use std::sync::Arc;
use ::log::{debug, info};
use axum::extract::State;
use axum::handler::Handler;
use axum::{Json, Router};
use axum::routing::{get, post};
use axum_client_ip::{SecureClientIp, SecureClientIpSource};
use clap::Parser;
use socketioxide::extract::SocketRef;
use socketioxide::handler::ConnectHandler;
use socketioxide::SocketIo;
use sqlx::Executor;
use crate::args::Args;
use crate::result::Result;
use crate::srvstate::{SrvState};

mod error;
mod result;
mod args;
mod config;
mod srvstate;
mod log;
mod db;
mod handlers;
mod middleware;
mod validators;
mod models;
mod query;
mod crypto;

#[tokio::main]
async fn main() -> Result<()> {
   let args = Args::parse()?;
   let config = config::read(&args.config_file)?;
   log::setup(&config.log)?;
   let pool = db::create_connection_pool(&config.db).await?;
   db::run_migrations(&pool).await?;

   let srvstate = SrvState { db: pool.clone(), config: config.clone() };
   let (layer, io) = SocketIo::builder()
       .with_state(srvstate)
       .build_layer();
   io.ns("/", handlers::ns_callback.with(middleware::auth));

   let srvstate = SrvState { db: pool, config: config.clone() };
   let app = Router::new()
       .route("/", get(handlers::web::index))
       .route("/service", get(handlers::web::service))
       .route("/register", post(handlers::web::register))
       .layer(layer)
       .layer(SecureClientIpSource::ConnectInfo.into_extension())
       .with_state(srvstate);

   debug!("Staring listener");
   let listener = tokio::net::TcpListener::bind(
      format!("127.0.0.1:{}", config.port)
   ).await?;
   info!("Listening on {}", config.port);
   axum::serve(
      listener,
      app.into_make_service_with_connect_info::<SocketAddr>(),
   ).await?;
   Ok(())
}