use std::env::set_var;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use ::log::{debug, info};
use axum::extract::State;
use axum::handler::Handler;
use axum::{Json, Router};
use axum::error_handling::HandleErrorLayer;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::routing::{get, post};
use clap::Parser;
use tower_http::trace::TraceLayer;
use socketioxide::extract::SocketRef;
use socketioxide::handler::ConnectHandler;
use socketioxide::SocketIo;
use sqlx::Executor;
use tower::{BoxError, ServiceBuilder};
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
mod email;
mod html;


#[macro_use]
extern crate rust_i18n;
rust_i18n::i18n!("locales");

#[tokio::main]
async fn main() -> Result<()> {
   let args = Args::parse()?;
   let config = config::read(&args.config_file)?;
   log::setup(&config.log)?;
   let pool = db::create_connection_pool(&config.db).await?;
   db::run_migrations(&pool).await?;

   let srvstate = SrvState { db: pool.clone(), config: config.clone() };
   let (socketio_layer, io) = SocketIo::builder()
       .with_state(srvstate)
       .build_layer();
   io.ns("/", handlers::ns_callback.with(middleware::auth));

   let srvstate = SrvState { db: pool, config: config.clone() };
   let app = Router::new()
       .route("/", get(handlers::http::index))
       .route("/service", get(handlers::http::service))
       .route("/register", post(handlers::http::register))
       .route("/username-unique", get(handlers::http::username_unique))
       .route("/email-unique", get(handlers::http::email_unique))
       .route("/email-verify-send", post(handlers::http::email_verify_send))
       .route("/email-verify", get(handlers::http::email_verify))
       .route("/email-verified", get(handlers::http::email_verified))
       .layer(socketio_layer)
       .layer(
          ServiceBuilder::new()
              .layer(HandleErrorLayer::new(handlers::http::error))
              .load_shed()
              .concurrency_limit(128)
              .timeout(Duration::from_secs(5))
              .layer(TraceLayer::new_for_http()),
       )
       .with_state(srvstate);

   debug!("Staring listener");
   let listener = tokio::net::TcpListener::bind(
      format!("127.0.0.1:{}", config.srv.port)
   ).await?;
   info!("Listening on {}", config.srv.port);
   axum::serve(
      listener,
      app.into_make_service_with_connect_info::<SocketAddr>(),
   ).await?;
   Ok(())
}