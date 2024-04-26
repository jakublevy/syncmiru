use std::sync::Arc;
use socketioxide::extract::{SocketRef, State};
use crate::models::query::Id;
use crate::query;
use crate::srvstate::SrvState;

pub async fn ns_callback(State(state): State<Arc<SrvState>>, s: SocketRef) {
    s.on_disconnect(disconnect);

    let uid = state.socket2uid(&s);
    let users = query::get_users(&state.db)
        .await
        .expect("db error");
    let user = query::get_user(&state.db, uid)
        .await
        .expect("db error");

    s.emit("users", &users).ok();
    s.broadcast().emit("users", user).ok();
    s.emit("me", uid).ok();

    let online_uids_lock = state.socket_uid
        .read()
        .expect("lock error");
    let online_uids = online_uids_lock.right_values().collect::<Vec<&Id>>();
    s.emit("online", &online_uids).ok();
    s.broadcast().emit("online", uid).ok();
}

pub async fn disconnect(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let mut uid: Id;
    {
        let mut socket_uid_lock = state.socket_uid
            .write()
            .expect("lock error");
        uid = socket_uid_lock.get_by_left(&s.id).map(|x|x.clone()).unwrap();
        socket_uid_lock.remove_by_left(&s.id);
    }
    s.broadcast().emit("offline", uid).ok();
}