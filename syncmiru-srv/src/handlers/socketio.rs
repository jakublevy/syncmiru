use std::collections::HashMap;
use std::hash::Hash;
use std::sync::Arc;
use rust_decimal::Decimal;
use socketioxide::extract::{AckSender, Data, SocketRef, State};
use validator::Validate;
use crate::models::{EmailWithLang, Tkn};
use crate::models::query::{EmailTknType, Id, RegDetail, RegTkn, RoomClient, RoomsClientWOrder, RoomSettings};
use crate::models::socketio::{IdStruct, Displayname, DisplaynameChange, SocketIoAck, EmailChangeTknType, EmailChangeTkn, ChangeEmail, AvatarBin, AvatarChange, Password, ChangePassword, Language, TknWithLang, RegTknCreate, RegTknName, PlaybackSpeed, DesyncTolerance, MajorDesyncMin, MinorDesyncPlaybackSlow, RoomName, RoomNameChange, RoomPlaybackSpeed, RoomDesyncTolerance, RoomMinorDesyncPlaybackSlow, RoomMajorDesyncMin, RoomOrder, JoinRoomReq, UserRoomChange, UserRoomJoin, UserRoomDisconnect, RoomPing, RoomUserPingChange};
use crate::{crypto, email, query};
use crate::handlers::utils;
use crate::srvstate::SrvState;

pub async fn ns_callback(State(state): State<Arc<SrvState>>, s: SocketRef) {
    s.on_disconnect(disconnect);
    s.on("get_users", get_users);
    s.on("get_me", get_me);
    s.on("get_online", get_online);
    s.on("get_user_sessions", get_user_sessions);
    s.on("delete_session", delete_session);
    s.on("sign_out", sign_out);
    s.on("set_displayname", set_displayname);
    s.on("get_email", get_email);
    s.on("get_email_resend_timeout", get_email_resend_timeout);
    s.on("get_reg_pub_allowed", get_reg_pub_allowed);
    s.on("send_email_change_verification_emails", send_email_change_verification_emails);
    s.on("check_email_change_tkn", check_email_change_tkn);
    s.on("change_email", change_email);
    s.on("set_avatar", set_avatar);
    s.on("delete_avatar", delete_avatar);
    s.on("check_password", check_password);
    s.on("change_password", change_password);
    s.on("send_delete_account_email", send_delete_account_email);
    s.on("check_delete_account_tkn", check_delete_account_tkn);
    s.on("delete_account", delete_account);
    s.on("create_reg_tkn", create_reg_tkn);
    s.on("active_reg_tkns", active_reg_tkns);
    s.on("inactive_reg_tkns", inactive_reg_tkns);
    s.on("check_reg_tkn_name_unique", check_reg_tkn_name_unique);
    s.on("delete_reg_tkn", delete_reg_tkn);
    s.on("get_reg_tkn_info", get_reg_tkn_info);
    s.on("get_default_playback_speed", get_default_playback_speed);
    s.on("set_default_playback_speed", set_default_playback_speed);
    s.on("get_default_desync_tolerance", get_default_desync_tolerance);
    s.on("set_default_desync_tolerance", set_default_desync_tolerance);
    s.on("get_default_major_desync_min", get_default_major_desync_min);
    s.on("set_default_major_desync_min", set_default_major_desync_min);
    s.on("get_default_minor_desync_playback_slow", get_default_minor_desync_playback_slow);
    s.on("set_default_minor_desync_playback_slow", set_default_minor_desync_playback_slow);
    s.on("check_room_name_unique", check_room_name_unique);
    s.on("create_room", create_room);
    s.on("get_rooms", get_rooms);
    s.on("set_room_name", set_room_name);
    s.on("delete_room", delete_room);
    s.on("get_room_playback_speed", get_room_playback_speed);
    s.on("set_room_playback_speed", set_room_playback_speed);
    s.on("get_room_desync_tolerance", get_room_desync_tolerance);
    s.on("set_room_desync_tolerance", set_room_desync_tolerance);
    s.on("get_room_minor_desync_playback_slow", get_room_minor_desync_playback_slow);
    s.on("set_room_minor_desync_playback_slow", set_room_minor_desync_playback_slow);
    s.on("get_room_major_desync_min", get_room_major_desync_min);
    s.on("set_room_major_desync_min", set_room_major_desync_min);
    s.on("set_room_order", set_room_order);
    s.on("ping", ping);
    s.on("join_room", join_room);
    s.on("disconnect_room", disconnect_room);
    s.on("get_room_users", get_room_users);
    s.on("room_ping", room_ping);
    s.on("get_room_pings", get_room_pings);
    s.on("get_room_settings", get_room_settings);

    let uid = state.socket2uid(&s).await;
    let user = query::get_user(&state.db, uid)
        .await
        .expect("db error");

    s.broadcast().emit("users", user).ok();
    s.broadcast().emit("online", uid).ok();
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
    } else {
        uid = uid_opt.unwrap()
    }
    let hwid_hash = state.socket2hwid_hash(&s).await;
    query::update_session_last_access_time_now(&state.db, uid, &hwid_hash)
        .await
        .expect("db error");

    s.leave_all().ok();
    {
        let mut rid_uids_lock = state.rid_uids.write().await;
        rid_uids_lock.remove_by_right(&uid);
    }

    s.broadcast().emit("offline", uid).ok();
}

pub async fn get_users(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let users = query::get_users(&state.db)
        .await
        .expect("db error");
    ack.send([users]).ok();
}

pub async fn get_me(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let uid = state.socket2uid(&s).await;
    ack.send(uid).ok();
}

pub async fn get_online(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let online_uids_lock = state.socket_uid.read().await;
    let online_uids = online_uids_lock.right_values().collect::<Vec<&Id>>();
    ack.send([online_uids]).ok();
}

pub async fn get_user_sessions(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let uid = state.socket2uid(&s).await;
    let hwid_hash = state.socket2hwid_hash(&s).await;
    let inactive_sessions = query::get_inactive_user_sessions(
        &state.db,
        uid,
        &hwid_hash,
    )
        .await
        .expect("getting inactive user sessions failed");
    s.emit("inactive_sessions", [inactive_sessions]).ok();

    let active_session = query::get_active_user_session(
        &state.db,
        uid,
        &hwid_hash,
    )
        .await
        .expect("getting active user sessions failed");

    s.emit("active_session", active_session).ok();
}

pub async fn delete_session(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let is_session_of_user = query::is_session_of_user(&state.db, payload.id, uid)
        .await
        .expect("db error");
    if !is_session_of_user {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let active_session = query::get_active_user_session(&state.db, uid, &state.socket2hwid_hash(&s).await)
        .await
        .expect("db error");
    if active_session.id == payload.id {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    query::delete_user_session(&state.db, payload.id)
        .await
        .expect("db error");
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn sign_out(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let uid = state.socket2uid(&s).await;
    let hwid = state.socket2hwid_hash(&s).await;
    query::delete_user_session_by_hwid_uid(&state.db, &hwid, uid)
        .await
        .expect("db error");
    s.disconnect().expect("disconnect error")
}

pub async fn get_email(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let uid = state.socket2uid(&s).await;
    let email = query::get_email_by_uid(&state.db, uid)
        .await
        .expect("db error");
    ack.send(email).ok();
}

pub async fn set_displayname(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Displayname>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    query::update_displayname_by_uid(&state.db, uid, &payload.displayname)
        .await
        .expect("db error");
    s
        .broadcast()
        .emit("displayname_change", DisplaynameChange { uid, displayname: payload.displayname.clone() })
        .ok();

    s
        .emit("displayname_change", DisplaynameChange { uid, displayname: payload.displayname })
        .ok();

    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_email_resend_timeout(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    ack.send(state.config.email.wait_before_resend + 1).ok();
}

pub async fn get_reg_pub_allowed(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    ack.send(state.config.reg_pub.allowed).ok();
}

pub async fn send_email_change_verification_emails(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<EmailWithLang>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;

    let out_of_quota = utils::is_change_email_out_of_quota(&state, uid)
        .await
        .expect("change_email_out_of_quota error");
    if out_of_quota {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let tkn1 = crypto::gen_tkn();
    let tkn1_hash = crypto::hash(tkn1.clone()).await.expect("hash error");
    let tkn2 = crypto::gen_tkn();
    let tkn2_hash = crypto::hash(tkn2.clone()).await.expect("hash error");
    let current_email = query::get_email_by_uid(&state.db, uid)
        .await
        .expect("db error");
    query::new_change_email(
        &state.db,
        &tkn1_hash,
        &tkn2_hash,
        uid,
    )
        .await
        .expect("db error");
    email::send_change_emails(
        &state.config.email,
        &current_email,
        &tkn1,
        &payload.email,
        &tkn2,
        &state.config.srv.url,
        &payload.lang,
    )
        .await
        .expect("email error");
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn check_email_change_tkn(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<EmailChangeTkn>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let uid = state.socket2uid(&s).await;

    let tkn_valid = utils::check_email_change_tkn(
        &state,
        &payload,
        uid,
    )
        .await
        .expect("checking email tkn error");

    ack.send(SocketIoAck::<bool>::ok(Some(tkn_valid))).ok();
}

pub async fn change_email(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<ChangeEmail>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let tkn_from_valid = utils::check_email_change_tkn(
        &state,
        &EmailChangeTkn { tkn: payload.tkn_from, tkn_type: EmailChangeTknType::From },
        uid,
    )
        .await
        .expect("checking email tkn error");

    if !tkn_from_valid {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let tkn_to_valid = utils::check_email_change_tkn(
        &state,
        &EmailChangeTkn { tkn: payload.tkn_to, tkn_type: EmailChangeTknType::To },
        uid,
    )
        .await
        .expect("checking email tkn error");

    if !tkn_to_valid {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let username = query::get_username_by_uid(
        &state.db,
        uid,
    )
        .await
        .expect("db error");
    let email_old = query::get_email_by_uid(
        &state.db,
        uid,
    )
        .await
        .expect("db error");

    if email_old == payload.email_new {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let mut transaction = state.db.begin()
        .await
        .expect("db error");
    query::update_email_by_uid(&mut transaction, uid, &payload.email_new)
        .await
        .expect("db error");
    query::invalidate_last_email_change_tkn(
        &mut transaction,
        uid,
        state.config.email.token_valid_time,
    )
        .await
        .expect("db error");

    email::send_email_changed_warning(
        &state.config.email,
        &email_old,
        &state.config.srv.url,
        &payload.email_new,
        &username,
        &payload.lang,
    )
        .await
        .expect("email error");
    ack.send(SocketIoAck::<()>::ok(None)).ok();
    transaction.commit().await.expect("db error");
}

pub async fn set_avatar(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<AvatarBin>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    query::update_avatar_by_uid(&state.db, uid, &payload.data)
        .await
        .expect("db error");

    s
        .broadcast()
        .emit("avatar_change", AvatarChange { uid, avatar: payload.data.clone() })
        .ok();

    s
        .emit("avatar_change", AvatarChange { uid, avatar: payload.data })
        .ok();

    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn delete_avatar(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let uid = state.socket2uid(&s).await;
    query::update_avatar_by_uid(&state.db, uid, &[])
        .await
        .expect("db error");

    s
        .broadcast()
        .emit("avatar_change", AvatarChange { uid, avatar: vec![] })
        .ok();

    s
        .emit("avatar_change", AvatarChange { uid, avatar: vec![] })
        .ok();
    ack.send({}).ok();
}

pub async fn check_password(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Password>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<bool>::ok(Some(false))).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let password_hash = query::get_user_hash_unsafe(&state.db, uid)
        .await
        .expect("db error");
    if crypto::verify(payload.password, password_hash).await.expect("argon2 error") {
        ack.send(SocketIoAck::<bool>::ok(Some(true))).ok();
        return;
    }
    ack.send(SocketIoAck::<bool>::ok(Some(false))).ok();
}

pub async fn change_password(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<ChangePassword>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let password_hash = query::get_user_hash_unsafe(&state.db, uid)
        .await
        .expect("db error");
    if crypto::verify(payload.old_password, password_hash).await.expect("argon2 error") {
        let new_hash = crypto::hash(payload.new_password)
            .await
            .expect("argon2 error");
        query::update_password_by_uid(&state.db, uid, &new_hash)
            .await
            .expect("db error");
        ack.send(SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(SocketIoAck::<()>::err()).ok();
}

pub async fn send_delete_account_email(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Language>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let email = query::get_email_by_uid(&state.db, uid)
        .await
        .expect("db error");

    let out_of_quota = utils::check_email_tkn_out_of_quota(
        &state, uid, EmailTknType::DeleteAccount,
    )
        .await
        .expect("check_email_tkn quota error");
    if !out_of_quota {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let tkn = crypto::gen_tkn();
    let tkn_hash = crypto::hash(tkn.clone())
        .await
        .expect("argon2 error");
    query::new_email_tkn(&state.db, uid, EmailTknType::DeleteAccount, &tkn_hash)
        .await
        .expect("db error");
    email::send_delete_account_email(
        &state.config.email,
        &email,
        &tkn,
        &state.config.srv.url,
        &payload.lang,
    )
        .await
        .expect("email error");

    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn check_delete_account_tkn(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Tkn>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let uid = state.socket2uid(&s).await;

    let hashed_tkn_opt = query::get_valid_hashed_tkn(
        &state.db,
        uid,
        EmailTknType::DeleteAccount,
        state.config.email.token_valid_time)
        .await
        .expect("invalid or expired token");

    if hashed_tkn_opt.is_none() {
        ack.send(SocketIoAck::<bool>::ok(Some(false))).ok();
        return;
    }
    let hashed_tkn = hashed_tkn_opt.unwrap();

    let tkn_valid = crypto::verify(payload.tkn, hashed_tkn)
        .await
        .expect("argon2 error");

    ack.send(SocketIoAck::<bool>::ok(Some(tkn_valid))).ok();
}

pub async fn delete_account(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<TknWithLang>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let uid = state.socket2uid(&s).await;

    let hashed_tkn_opt = query::get_valid_hashed_tkn(
        &state.db,
        uid,
        EmailTknType::DeleteAccount,
        state.config.email.token_valid_time)
        .await
        .expect("invalid or expired token");

    if hashed_tkn_opt.is_none() {
        ack.send(SocketIoAck::<bool>::ok(Some(false))).ok();
        return;
    }
    let hashed_tkn = hashed_tkn_opt.unwrap();

    let tkn_valid = crypto::verify(payload.tkn, hashed_tkn)
        .await
        .expect("argon2 error");

    if !tkn_valid {
        ack.send(SocketIoAck::<bool>::ok(Some(false))).ok();
        return;
    }
    let username = query::get_username_by_uid(&state.db, uid)
        .await
        .expect("db error");
    let email = query::get_email_by_uid(&state.db, uid)
        .await
        .expect("db error");
    query::delete_user_by_uid(&state.db, uid)
        .await
        .expect("db error");

    s.broadcast().emit("del_users", [[uid]]).ok();

    email::send_account_deleted_email_warning(
        &state.config.email,
        &email,
        &username,
        &state.config.srv.url,
        &payload.lang,
    )
        .await
        .expect("email error");
    ack.send(SocketIoAck::<bool>::ok(Some(true))).ok();
}

pub async fn create_reg_tkn(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RegTknCreate>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let unique = query::reg_tkn_name_unique(&state.db, &payload.reg_tkn_name)
        .await
        .expect("db error");
    if !unique {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let key = crypto::gen_tkn();
    let reg_tkn_id = query::new_reg_tkn(
        &state.db,
        &payload.reg_tkn_name,
        &key,
        payload.max_regs,
    )
        .await
        .expect("db error");

    let reg_tkn = RegTkn {
        id: reg_tkn_id,
        max_reg: payload.max_regs,
        name: payload.reg_tkn_name,
        used: 0,
        key,
    };

    s.emit("active_reg_tkns", [[&reg_tkn]]).ok();
    s.broadcast().emit("active_reg_tkns", [[reg_tkn]]).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn active_reg_tkns(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let active_reg_tkns = query::get_active_reg_tkns(&state.db)
        .await
        .expect("db error");
    ack.send([active_reg_tkns]).ok();
}

pub async fn inactive_reg_tkns(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let inactive_reg_tkns = query::get_inactive_reg_tkns(&state.db)
        .await
        .expect("db error");
    ack.send([inactive_reg_tkns]).ok();
}

pub async fn check_reg_tkn_name_unique(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RegTknName>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<bool>::err()).ok();
        return;
    }
    let unique = query::reg_tkn_name_unique(&state.db, &payload.reg_tkn_name)
        .await
        .expect("db error");
    ack.send(SocketIoAck::<bool>::ok(Some(unique))).ok();
}

pub async fn delete_reg_tkn(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let mut transaction = state.db.begin().await.expect("db error");
    let exists = query::reg_tkn_exists_for_update(&mut transaction, payload.id)
        .await
        .expect("db error");
    if exists {
        query::delete_reg_tkn(&mut transaction, payload.id)
            .await
            .expect("db error");

        s.broadcast().emit("del_active_reg_tkns", [[payload.id]]).ok();
        ack.send(SocketIoAck::<()>::ok(None)).ok();
        transaction
            .commit()
            .await
            .expect("db error");
    }
    else {
        ack.send(SocketIoAck::<()>::err()).ok();
    }
}

pub async fn get_reg_tkn_info(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<Vec<RegDetail>>::err()).ok();
        return;
    }
    let tkn_detail = query::get_reg_tkn_info(&state.db, payload.id)
        .await
        .expect("db error");
    ack.send(SocketIoAck::<Vec<RegDetail>>::ok(Some(tkn_detail))).ok();
}

pub async fn get_default_playback_speed(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let default_playback_speed = query::get_default_playback_speed(&state.db)
        .await
        .expect("db error");
    ack.send(SocketIoAck::<Decimal>::ok(Some(default_playback_speed))).ok();
}

pub async fn set_default_playback_speed(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaybackSpeed>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_default_playback_speed(&state.db, &payload.playback_speed)
        .await
        .expect("db error");

    s.broadcast().emit("default_playback_speed", payload.playback_speed).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_default_desync_tolerance(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let default_desync_tolerance = query::get_default_desync_tolerance(&state.db)
        .await
        .expect("db error");
    ack.send(SocketIoAck::<Decimal>::ok(Some(default_desync_tolerance))).ok();
}

pub async fn set_default_desync_tolerance(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<DesyncTolerance>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_default_desync_tolerance(&state.db, &payload.desync_tolerance)
        .await
        .expect("db error");

    s.broadcast().emit("default_desync_tolerance", payload.desync_tolerance).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_default_major_desync_min(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let default_major_desync_min = query::get_default_major_desync_min(&state.db)
        .await
        .expect("db error");
    ack.send(SocketIoAck::<Decimal>::ok(Some(default_major_desync_min))).ok();
}

pub async fn set_default_major_desync_min(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<MajorDesyncMin>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_default_major_desync_min(&state.db, &payload.major_desync_min)
        .await
        .expect("db error");

    s.broadcast().emit("default_major_desync_min", payload.major_desync_min).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_default_minor_desync_playback_slow(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let minor_desync_playback_slow = query::get_default_minor_desync_playback_slow(&state.db)
        .await
        .expect("db error");
    ack.send(SocketIoAck::<Decimal>::ok(Some(minor_desync_playback_slow))).ok();
}

pub async fn set_default_minor_desync_playback_slow(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<MinorDesyncPlaybackSlow>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_default_minor_desync_playback_slow(&state.db, &payload.minor_desync_playback_slow)
        .await
        .expect("db error");

    s.broadcast().emit("default_minor_desync_playback_slow", payload.minor_desync_playback_slow).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn check_room_name_unique(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomName>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<bool>::err()).ok();
        return;
    }
    let unique = query::room_name_unique(&state.db, &payload.room_name)
        .await
        .expect("db error");
    ack.send(SocketIoAck::<bool>::ok(Some(unique))).ok();
}

pub async fn create_room(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomName>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let unique = query::room_name_unique(&state.db, &payload.room_name)
        .await
        .expect("db error");
    if !unique {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let default_room_settings = query::get_default_room_settings(&state.db)
        .await
        .expect("db error");

    let mut transaction = state.db.begin().await.expect("db error");
    let room_id = query::new_room(
        &mut transaction,
        &payload.room_name,
        &default_room_settings.playback_speed,
        &default_room_settings.desync_tolerance,
        &default_room_settings.minor_desync_playback_slow,
        &default_room_settings.major_desync_min,
    )
        .await
        .expect("db error");
    let mut room_order = query::get_room_order_for_update(&mut transaction)
        .await
        .expect("db error");
    room_order.push(room_id);
    query::set_room_order(&mut transaction, &room_order)
        .await
        .expect("db error");

    let room = RoomClient {
        id: room_id,
        name: payload.room_name,
    };
    s.broadcast().emit("rooms", [[&room]]).ok();
    s.emit("rooms", [[&room]]).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();

    transaction
        .commit()
        .await
        .expect("db error");
}

pub async fn get_rooms(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let mut transaction = state.db.begin().await.expect("db error");
    let rooms = query::get_rooms_for_update(&mut transaction)
        .await
        .expect("db error");
    let room_order = query::get_room_order_for_update(&mut transaction)
        .await
        .expect("db error");

    let rooms_w_order = RoomsClientWOrder { room_order, rooms };
    ack.send(rooms_w_order).ok();
    transaction
        .commit()
        .await
        .expect("db error");
}

pub async fn set_room_name(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomNameChange>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_room_name(&state.db, payload.rid, &payload.room_name)
        .await
        .expect("db error");

    s.broadcast().emit("room_name_change", [[&payload]]).ok();
    s.emit("room_name_change", [[payload]]).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn delete_room(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let mut transaction = state.db.begin().await.expect("db error");
    let exists = query::room_exists_for_update(&mut transaction, payload.id)
        .await
        .expect("db error");
    if exists {
        query::delete_room(&mut transaction, payload.id)
            .await
            .expect("db error");
        let room_order = query::get_room_order_for_update(&mut transaction)
            .await
            .expect("db error");
        let new_room_order = room_order
            .iter()
            .filter(|&x| *x != payload.id)
            .map(|x| x.clone())
            .collect::<Vec<Id>>();
        query::set_room_order(&mut transaction, &new_room_order)
            .await
            .expect("db error");

        let room_name = payload.id.to_string();
        {
            let mut rid_uids_lock = state.rid_uids.write().await;
            let io_lock = state.io.read().await;
            let io = io_lock.as_ref().unwrap().clone();
            io.leave([room_name]).ok();
            rid_uids_lock.remove_by_left(&payload.id);
        }
        s.broadcast().emit("del_rooms", [[payload.id]]).ok();
        s.emit("del_rooms", [[payload.id]]).ok();
        ack.send(SocketIoAck::<()>::ok(None)).ok();
        transaction
            .commit()
            .await
            .expect("db error");
    }
    else {
        ack.send(SocketIoAck::<()>::err()).ok();
    }
}

pub async fn get_room_playback_speed(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let playback_speed_opt = query::get_room_playback_speed(&state.db, payload.id)
        .await
        .expect("db error");
    if playback_speed_opt.is_none() {
        ack.send(SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let playback_speed = playback_speed_opt.unwrap();
    ack.send(SocketIoAck::<Decimal>::ok(Some(playback_speed))).ok();
}

pub async fn set_room_playback_speed(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomPlaybackSpeed>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let updated = query::set_room_playback_speed(&state.db, payload.id, &payload.playback_speed)
        .await
        .expect("db error");

    if !updated {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    s.broadcast().emit("room_playback_speed", payload).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_room_desync_tolerance(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let desync_tolerance_opt = query::get_room_desync_tolerance(&state.db, payload.id)
        .await
        .expect("db error");
    if desync_tolerance_opt.is_none() {
        ack.send(SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let desync_tolerance = desync_tolerance_opt.unwrap();
    ack.send(SocketIoAck::<Decimal>::ok(Some(desync_tolerance))).ok();
}

pub async fn set_room_desync_tolerance(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomDesyncTolerance>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let updated = query::set_room_desync_tolerance(&state.db, payload.id, &payload.desync_tolerance)
        .await
        .expect("db error");

    if !updated {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    s.broadcast().emit("room_desync_tolerance", payload).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_room_minor_desync_playback_slow(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let room_minor_desync_playback_slow_opt = query::get_room_minor_desync_playback_slow(&state.db, payload.id)
        .await
        .expect("db error");
    if room_minor_desync_playback_slow_opt.is_none() {
        ack.send(SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let room_minor_desync_playback_slow = room_minor_desync_playback_slow_opt.unwrap();
    ack.send(SocketIoAck::<Decimal>::ok(Some(room_minor_desync_playback_slow))).ok();
}

pub async fn set_room_minor_desync_playback_slow(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomMinorDesyncPlaybackSlow>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let updated = query::set_room_minor_desync_playback_slow(&state.db, payload.id, &payload.minor_desync_playback_slow)
        .await
        .expect("db error");

    if !updated {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    s.broadcast().emit("room_minor_desync_playback_slow", payload).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_room_major_desync_min(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let room_major_desync_min_opt = query::get_room_major_desync_min(&state.db, payload.id)
        .await
        .expect("db error");
    if room_major_desync_min_opt.is_none() {
        ack.send(SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let room_major_desync_min = room_major_desync_min_opt.unwrap();
    ack.send(SocketIoAck::<Decimal>::ok(Some(room_major_desync_min))).ok();
}

pub async fn set_room_major_desync_min(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomMajorDesyncMin>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let updated = query::set_room_major_desync_min(&state.db, payload.id, &payload.major_desync_min)
        .await
        .expect("db error");

    if !updated {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    s.broadcast().emit("room_major_desync_min", payload).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn set_room_order(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomOrder>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let mut transaction = state.db.begin().await.expect("db error");
    let valid = query::room_order_valid(&mut transaction, &payload.room_order)
        .await
        .expect("db error");
    if !valid {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_room_order(&mut transaction, &payload.room_order)
        .await
        .expect("db error");

    s.broadcast().emit("room_order", [payload.room_order]).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
    transaction
        .commit()
        .await
        .expect("db error");
}

pub async fn ping(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    ack.send({}).ok();
}

pub async fn join_room(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<JoinRoomReq>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let mut transaction = state.db.begin().await.expect("db error");
    let room_exists = query::room_exists_for_update(&mut transaction, payload.rid)
        .await
        .expect("db error");
    if !room_exists {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let old_connected_room_opt = state.socket_connected_room(&s).await;
    let new_room_name = payload.rid.to_string();
    {
        let mut uid_ping_lock = state.uid_ping.write().await;
        let mut rid_uids_lock = state.rid_uids.write().await;
        rid_uids_lock.insert(payload.rid, uid);
        uid_ping_lock.insert(uid, payload.ping);

        s.leave_all().ok();
        s.join(new_room_name.clone()).ok();
    }
    s.to(new_room_name).emit("room_user_ping", RoomUserPingChange{ uid, ping: payload.ping }).ok();

    if let Some(old_connected_room) = old_connected_room_opt {
        let urc = UserRoomChange { uid, old_rid: old_connected_room, new_rid: payload.rid };
        s.broadcast().emit("user_room_change", &urc).ok();
        s.emit("user_room_change", urc).ok();
    }
    else {
        let urj = UserRoomJoin { uid, rid: payload.rid };
        s.broadcast().emit("user_room_join", &urj).ok();
        s.emit("user_room_join", urj).ok();
    }

    ack.send(SocketIoAck::<()>::ok(None)).ok();
    transaction.commit().await.expect("db error");
}

pub async fn disconnect_room(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let uid = state.socket2uid(&s).await;
    let connected_room_opt = state.socket_connected_room(&s).await;
    if connected_room_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    {
        let mut rid_uids_lock = state.rid_uids.write().await;
        s.leave_all().ok();
        rid_uids_lock.remove_by_right(&uid);
    }
    let urd = UserRoomDisconnect{ rid: connected_room_opt.unwrap(), uid };
    s.broadcast().emit("user_room_disconnect", &urd).ok();
    s.emit("user_room_disconnect", urd).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_room_users(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let rid_uids_lock = state.rid_uids.read().await;
    let rid2uids = rid_uids_lock.get_key_to_values_hashmap().clone();
    ack.send(rid2uids).ok();
}

pub async fn room_ping(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomPing>,
) {
    let connected_room_opt = state.socket_connected_room(&s).await;
    if connected_room_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    {
        let mut uid_ping_lock = state.uid_ping.write().await;
        uid_ping_lock.insert(uid, payload.ping);
    }
    let room_name = connected_room_opt.unwrap().to_string();
    s.to(room_name).emit("room_user_ping", RoomUserPingChange{ uid, ping: payload.ping }).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_room_pings(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let connected_room_opt = state.socket_connected_room(&s).await;
    if connected_room_opt.is_none() {
        ack.send(SocketIoAck::<HashMap<Id, f64>>::err()).ok();
        return;
    }
    let connected_room = connected_room_opt.unwrap();
    let mut room_pings = HashMap::<Id, f64>::new();
    {
        let rid_uids_lock = state.rid_uids.read().await;
        let uids_in_room = rid_uids_lock.get_by_left(&connected_room).unwrap();
        let uid_ping_lock = state.uid_ping.read().await;
        room_pings = uid_ping_lock
                .iter()
                .filter(|&(id, ping)| uids_in_room.contains(id))
                .map(|(id, ping)| (*id, *ping))
                .collect::<HashMap<Id, f64>>();
    }
    ack.send(SocketIoAck::<HashMap<Id, f64>>::ok(Some(room_pings))).ok();
}

pub async fn get_room_settings(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let connected_room_opt = state.socket_connected_room(&s).await;
    if connected_room_opt.is_none() {
        ack.send(SocketIoAck::<RoomSettings>::err()).ok();
        return;
    }
    let connected_room = connected_room_opt.unwrap();
    let room_settings = query::get_room_settings(&state.db, connected_room)
        .await
        .expect("db error");

    ack.send(SocketIoAck::<RoomSettings>::ok(Some(room_settings))).ok();
}