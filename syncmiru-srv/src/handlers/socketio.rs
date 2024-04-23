use std::sync::Arc;
use socketioxide::extract::{SocketRef, State};
use crate::query;
use crate::srvstate::SrvState;

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