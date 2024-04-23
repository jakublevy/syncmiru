use std::sync::Arc;
use socketioxide::extract::{SocketRef, State};
use crate::query;
use crate::result::Result;
use crate::srvstate::SrvState;

pub mod http;
pub mod socketio;

pub async fn ns_callback(State(state): State<Arc<SrvState>>, s: SocketRef) {
    println!("client connected to /");
    s.on("test", socketio::test);
    s.on_disconnect(socketio::disconnect);

    let uid = state.socket2uid(&s);
    let p = query::get_current_user(&state.db, uid)
        .await
        .expect("db error");

    s.emit("my-profile", p).ok();
}
