use std::cell::Cell;
use std::collections::{HashMap, HashSet};
use std::env::set_var;
use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use ::log::{debug, info, warn};
use axum::extract::State;
use axum::handler::Handler;
use axum::{Json, Router};
use axum::error_handling::HandleErrorLayer;
use axum::http::{Method, StatusCode};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use bimap::BiMap;
use clap::Parser;
use tower_http::trace::TraceLayer;
use socketioxide::extract::SocketRef;
use socketioxide::handler::ConnectHandler;
use socketioxide::SocketIo;
use sqlx::Executor;
use tokio::sync::mpsc;
use tokio::sync::mpsc::{Receiver, Sender};
use tower::{BoxError, ServiceBuilder};
use tower_http::cors::CorsLayer;
use crate::args::Args;
use crate::constants::SOCKETIO_ACK_TIMEOUT;
use crate::bimultimap::BiMultiMap;
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
mod tkn;
mod constants;
mod bimultimap;
mod file;
mod trait_ext;


#[macro_use]
extern crate rust_i18n;
rust_i18n::i18n!("locales");

#[tokio::main]
async fn main() -> Result<()> {
   let args = Args::parse()?;
   let config = config::read(&args.config_file)?;
   let pool = db::create_connection_pool(&config.db).await?;
   db::run_migrations(&pool).await?;

   let (desync_timer_tx, desync_timer_rx)
       : (Sender<handlers::timers::DesyncTimerInterface>, Receiver<handlers::timers::DesyncTimerInterface>) = mpsc::channel(1);

   let srvstate = Arc::new(
      SrvState {
         config: config.clone(),
         db: pool.clone(),
         desync_timer_tx,
         socket_uid: BiMap::new().into(),
         socket_uid_disconnect: HashMap::new().into(),
         io: None.into(),
         sid_hwid_hash: HashMap::new().into(),
         rid_uids: BiMultiMap::new().into(),
         uid_ping: HashMap::new().into(),
         playlist_entry_next_id: 1u64.into(),
         playlist: HashMap::new().into(),
         rid_video_id: BiMultiMap::new().into(),
         uid2ready_status: HashMap::new().into(),
         rid2play_info: HashMap::new().into(),
         uid2play_info: HashMap::new().into(),
         rid2runtime_state: HashMap::new().into(),
         uid2timestamp: HashMap::new().into(),
         uid2minor_desync: HashSet::new().into()
      });

   let socketio_srvstate = srvstate.clone();
   let (socketio_layer, io) = SocketIo::builder()
       .ack_timeout(SOCKETIO_ACK_TIMEOUT)
       .with_state(socketio_srvstate.clone())
       .build_layer();
   {
      let mut io_lock = socketio_srvstate.io.write().await;
      *io_lock = Some(io.clone());
   }

   tokio::spawn(handlers::timers::desync_timer_controller(srvstate.clone(), desync_timer_rx));

   io.ns("/", handlers::socketio::ns_callback.with(middleware::auth));

   let app = Router::new()
       .route("/", get(handlers::http::index))
       .route("/service", get(handlers::http::service))
       .route("/register", post(handlers::http::register))
       .route("/username-unique", get(handlers::http::username_unique))
       .route("/email-unique", get(handlers::http::email_unique))
       .route("/email-verify-send", post(handlers::http::email_verify_send))
       .route("/email-verify", get(handlers::http::email_verify))
       .route("/email-verified", get(handlers::http::email_verified))
       .route("/forgotten-password-send", post(handlers::http::forgotten_password_send))
       .route("/forgotten-password-tkn-valid", get(handlers::http::forgotten_password_tkn_valid))
       .route("/forgotten-password-change", post(handlers::http::forgotten_password_change))
       .route("/new-login", post(handlers::http::new_login))
       .route("/reg-tkn-valid", get(handlers::http::reg_tkn_valid))
       .layer(socketio_layer)
       .layer(
          ServiceBuilder::new()
              .layer(CorsLayer::new()
                  .allow_methods([Method::GET, Method::POST])
                  .allow_origin(tower_http::cors::Any)
              )
              .layer(HandleErrorLayer::new(handlers::http::error))
              .load_shed()
              .concurrency_limit(128)
              .timeout(Duration::from_secs(10))
              .layer(TraceLayer::new_for_http()),
       )
       .with_state(srvstate);

   debug!("Starting listener");
   let listener = tokio::net::TcpListener::bind(
      format!("0.0.0.0:{}", config.srv.port)
   ).await?;
   info!("Listening on {}", config.srv.port);
   axum::serve(
      listener,
      app.into_make_service_with_connect_info::<SocketAddr>(),
   ).await?;
   Ok(())
}