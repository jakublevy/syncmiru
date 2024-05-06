use std::sync::Arc;
use socketioxide::extract::{AckSender, Data, SocketRef, State};
use validator::Validate;
use crate::models::query::Id;
use crate::models::socketio::{IdStruct, Displayname, DisplaynameChange};
use crate::query;
use crate::srvstate::SrvState;

pub async fn ns_callback(State(state): State<Arc<SrvState>>, s: SocketRef) {
    s.on_disconnect(disconnect);
    s.on("req_user_sessions", get_user_sessions);
    s.on("delete_session", delete_session);
    s.on("sign_out", sign_out);
    s.on("req_my_username", req_my_username);
    s.on("req_my_displayname", req_my_displayname);
    s.on("req_my_email", req_my_email);
    s.on("set_my_displayname", set_my_displayname);

    let uid = state.socket2uid(&s).await;
    let users = query::get_verified_users(&state.db)
        .await
        .expect("db error");
    let user = query::get_user(&state.db, uid)
        .await
        .expect("db error");

    s.emit("users", [&users]).ok();
    s.broadcast().emit("users", [[user]]).ok();
    s.emit("me", uid).ok();

    let online_uids_lock = state.socket_uid.read().await;
    let online_uids = online_uids_lock.right_values().collect::<Vec<&Id>>();
    s.emit("online", [&online_uids]).ok();
    s.broadcast().emit("online", [[uid]]).ok();
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

pub async fn delete_session(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>
) {
    if let Err(_) = payload.validate() {
        return;
    }
    let uid = state.socket2uid(&s).await;
    let is_session_of_user = query::is_session_of_user(&state.db, payload.id, uid)
        .await
        .expect("db error");
    if !is_session_of_user {
        return;
    }
    let active_session = query::get_active_user_session(&state.db, uid, &state.socket2hwid_hash(&s).await)
        .await
        .expect("db error");
    if active_session.id == payload.id {
        return;
    }
    query::delete_user_session(&state.db, payload.id)
        .await
        .expect("db error");
    ack.send({}).ok();
}

pub async fn sign_out(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let uid = state.socket2uid(&s).await;
    let hwid = state.socket2hwid_hash(&s).await;
    query::delete_user_session_by_hwid_uid(&state.db, &hwid, uid)
        .await
        .expect("db error");
    s.disconnect().expect("disconnect error")
}

pub async fn req_my_username(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let uid = state.socket2uid(&s).await;
    let username = query::get_username_by_uid(&state.db, uid)
        .await
        .expect("db error");
    s.emit("my_username", username).ok();
}

pub async fn req_my_displayname(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let uid = state.socket2uid(&s).await;
    let displayname = query::get_displayname_by_uid(&state.db, uid)
        .await
        .expect("db error");
    s.emit("my_displayname", displayname).ok();
}

pub async fn req_my_email(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let uid = state.socket2uid(&s).await;
    let email = query::get_email_by_uid(&state.db, uid)
        .await
        .expect("db error");
    s.emit("my_email", email).ok();
}

pub async fn set_my_displayname(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Displayname>
) {
    if let Err(_) = payload.validate() {
        return;
    }
    let uid = state.socket2uid(&s).await;
    query::update_displayname_by_uid(&state.db, uid, &payload.displayname)
        .await
        .expect("db error");
    s
        .broadcast()
        .emit("displayname_change", DisplaynameChange{uid, displayname: payload.displayname.clone()})
        .ok();

    s
        .emit("displayname_change", DisplaynameChange{uid, displayname: payload.displayname})
        .ok();

    ack.send({}).ok();
}

pub async fn disconnect(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let mut uid_opt: Option<Id>;
    {
        let mut socket_uid_lock = state.socket_uid.write().await;
        uid_opt = socket_uid_lock.get_by_left(&s.id).map(|x| x.clone());
        socket_uid_lock.remove_by_left(&s.id);
    }
    let mut uid: Id;
    if let None = uid_opt {
        let mut socket_uid_disconnect_wl = state.socket_uid_disconnect.write().await;
        uid = socket_uid_disconnect_wl.get(&s.id).unwrap().clone();
        socket_uid_disconnect_wl.remove(&s.id);
    }
    else {
        uid = uid_opt.unwrap()
    }
    let hwid_hash = state.socket2hwid_hash(&s).await;
    query::update_session_last_access_time_now(&state.db, uid, &hwid_hash)
        .await
        .expect("db error");
    s.broadcast().emit("offline", uid).ok();
}