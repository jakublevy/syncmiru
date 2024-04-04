use std::env::set_var;
use std::net::SocketAddr;
use std::sync::Arc;
use ::log::{debug, info};
use axum::extract::State;
use axum::handler::Handler;
use axum::{Json, Router};
use axum::routing::get;
use axum_client_ip::{SecureClientIp, SecureClientIpSource};
use clap::Parser;
use socketioxide::extract::SocketRef;
use socketioxide::handler::ConnectHandler;
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
mod middleware;

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


   io.ns("/auth", handlers::auth_callback.with(middleware::auth));
   io.ns("/pub", handlers::pub_callback);

   let webstate = WebState { reg_pub_allowed: config.reg_pub.allowed };
   let app = Router::new()
       .route("/", get(index))
       .route("/service", get(service))
       .layer(layer)
       .layer(SecureClientIpSource::ConnectInfo.into_extension())
       .with_state(webstate);

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

async fn index(secure_ip: SecureClientIp) -> &'static str {
   info!("Req / from ip {}", secure_ip.0);
   "Syncmiru server"
}

async fn service(State(state): State<WebState>, secure_ip: SecureClientIp) -> Json<WebState> {
   info!("Req /service from ip {}", secure_ip.0);
   Json(state)
}
