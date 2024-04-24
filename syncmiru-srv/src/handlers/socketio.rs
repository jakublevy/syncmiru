use std::sync::Arc;
use socketioxide::extract::{SocketRef, State};
use crate::query;
use crate::srvstate::SrvState;

pub async fn ns_callback(State(state): State<Arc<SrvState>>, s: SocketRef) {
    println!("client connected to /");
    s.on("test", test);
    s.on_disconnect(disconnect);

    let uid = state.socket2uid(&s);
    let users = query::get_users(&state.db)
        .await
        .expect("db error");
    let user = query::get_user(&state.db, uid)
        .await
        .expect("db error");

    s.emit("users", users).ok();
    s.emit("me", uid).ok();
    s.broadcast().emit("users", user).ok();
}


pub async fn test(State(state): State<Arc<SrvState>>, s: SocketRef) {
    println!("test handler called from s.id = {}", s.id);
}

pub async fn disconnect(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let mut socket_id2_uid_lock = state.socket_id2_uid
        .write()
        .expect("lock error");
    socket_id2_uid_lock.remove(&s.id);
    println!("client disconnected from socketio");
}