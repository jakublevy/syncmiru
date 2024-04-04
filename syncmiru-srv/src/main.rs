use std::env::set_var;
use std::sync::Arc;
use ::log::{debug, info};
use axum::extract::State;
use axum::handler::Handler;
use axum::{Json, Router};
use axum::routing::get;
use clap::Parser;
use socketioxide::extract::SocketRef;
use socketioxide::SocketIo;
use sqlx::Executor;
use crate::args::Args;
use crate::result::Result;
use crate::srvstate::{SrvState, WebState};

mod error;
mod result;
mod args;
mod config;
mod srvstate;
mod log;
mod db;
mod handlers;

#[tokio::main]
async fn main() -> Result<()> {
   let args = Args::parse()?;
   let config = config::read(&args.config_file)?;
   log::setup(&config.log)?;
   let pool = db::create_connection_pool(&config.db).await?;
   db::run_migrations(&pool).await?;

   let srvstate = SrvState { db: pool, config: config.clone() };

   let (layer, io) = SocketIo::builder()
       .with_state(srvstate)
       .build_layer();

   io.ns("/public", |s: SocketRef| {
      s.on("login", handlers::public::login);
      s.on("login", handlers::public::register);
      s.on("forgotten-password", handlers::public::forgotten_password);
   });

   let webstate = WebState { reg_pub_allowed: config.reg_pub.allowed };
   let app = Router::new()
       .route("/", get(|| async { "Syncmiru server" }))
       .route("/service", get(service))
       .layer(layer)
       .with_state(webstate);

   debug!("Staring listener");
   let listener = tokio::net::TcpListener::bind(
      format!("127.0.0.1:{}", config.port)
   ).await?;
   info!("Listening on {}", config.port);
   axum::serve(listener, app).await?;
   Ok(())
}

async fn service(State(state): State<WebState>) -> Json<WebState> {
   Json(state)
}
