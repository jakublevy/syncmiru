use std::sync::Arc;
use socketioxide::extract::{SocketRef, State};
use crate::models::query::Id;
use crate::query;
use crate::srvstate::SrvState;

pub async fn ns_callback(State(state): State<Arc<SrvState>>, s: SocketRef) {
    s.on_disconnect(disconnect);
    s.on("get_user_sessions", get_user_sessions);

    let uid = state.socket2uid(&s).await;
    let users = query::get_verified_users(&state.db)
        .await
        .expect("db error");
    let user = query::get_user(&state.db, uid)
        .await
        .expect("db error");

    s.emit("users", &users).ok();
    s.broadcast().emit("users", user).ok();
    s.emit("me", uid).ok();

    let online_uids_lock = state.socket_uid.read().await;
    let online_uids = online_uids_lock.right_values().collect::<Vec<&Id>>();
    s.emit("online", &online_uids).ok();
    s.broadcast().emit("online", uid).ok();
}

pub async fn get_user_sessions(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let uid = state.socket2uid(&s).await;
    let hwid_hash = state.socket2hwid_hash(&s).await;
    let inactive_sessions = query::get_inactive_user_sessions(
        &state.db,
        uid,
        &hwid_hash
    )
        .await
        .expect("getting inactive user sessions failed");
    s.emit("inactive_sessions", [inactive_sessions]).ok();

    let active_session = query::get_active_user_session(
        &state.db,
        uid,
        &hwid_hash
    )
        .await
        .expect("getting active user sessions failed");

    s.emit("active_session", active_session).ok();
}

pub async fn disconnect(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let mut uid: Option<Id>;
    {
        let mut socket_uid_lock = state.socket_uid.write().await;
        uid = socket_uid_lock.get_by_left(&s.id).map(|x| x.clone());
        socket_uid_lock.remove_by_left(&s.id);
    }
    if let Some(uid) = uid {
        let hwid_hash = state.socket2hwid_hash(&s).await;
        query::update_session_last_access_time_now(&state.db, uid, &hwid_hash)
            .await
            .expect("db error");
        s.broadcast().emit("offline", uid).ok();
    }
}