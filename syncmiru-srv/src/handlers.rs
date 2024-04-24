use std::sync::Arc;
use serde_json::json;
use socketioxide::extract::{SocketRef, State};
use crate::query;
use crate::srvstate::SrvState;

pub mod http;
pub mod socketio;

pub async fn ns_callback(State(state): State<Arc<SrvState>>, s: SocketRef) {
    println!("client connected to /");
    s.on("test", socketio::test);
    s.on_disconnect(socketio::disconnect);

    let uid = state.socket2uid(&s);
    let users = query::get_users(&state.db)
        .await
        .expect("db error");

    s.emit("users", [users]).ok();
    s.emit("me", uid).ok();
}
