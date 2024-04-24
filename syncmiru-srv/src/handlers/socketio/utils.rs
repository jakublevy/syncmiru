use std::collections::HashMap;
use std::sync::RwLock;
use socketioxide::extract::SocketRef;
use crate::handlers::socketio::utils;
use crate::models::query::Id;

pub(super) fn send_online_uids(
    s: &SocketRef,
    socket_id2_uid: &RwLock<HashMap<socketioxide::socket::Sid, Id>>
) {
    let online_uids = online_uids(socket_id2_uid);
    s.emit("online", &online_uids).ok();
    s.broadcast().emit("online", online_uids).ok();
}

fn online_uids(socket_id2_uid: &RwLock<HashMap<socketioxide::socket::Sid, Id>>) -> Vec<Id> {
    socket_id2_uid
        .read()
        .expect("socket_id2_uid read lock error")
        .values()
        .cloned()
        .collect::<Vec<Id>>()
}