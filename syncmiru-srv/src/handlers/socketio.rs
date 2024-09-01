use std::collections::{HashMap, HashSet};
use std::hash::Hash;
use std::sync::Arc;
use indexmap::{IndexMap, IndexSet};
use rust_decimal::Decimal;
use socketioxide::extract::{AckSender, Data, SocketRef, State};
use validator::Validate;
use crate::models::{EmailWithLang, Tkn};
use crate::models::query::{EmailTknType, Id, RegDetail, RegTkn, RoomClient, RoomsClientWOrder};
use crate::models::socketio::{IdStruct, Displayname, DisplaynameChange, SocketIoAck, EmailChangeTknType, EmailChangeTkn, ChangeEmail, AvatarBin, AvatarChange, Password, ChangePassword, Language, TknWithLang, RegTknCreate, RegTknName, PlaybackSpeed, DesyncTolerance, MajorDesyncMin, MinorDesyncPlaybackSlow, RoomName, RoomNameChange, RoomPlaybackSpeed, RoomDesyncTolerance, RoomMinorDesyncPlaybackSlow, RoomMajorDesyncMin, RoomOrder, JoinRoomReq, UserRoomChange, UserRoomJoin, UserRoomDisconnect, RoomPing, RoomUserPingChange, JoinedRoomInfo, GetFilesInfo, FileKind, AddVideoFiles, PlaylistEntryIdStruct, PlaylistOrder, AddSubtitlesFiles, AddUrls, UserReadyStateChangeReq, UserReadyStateChangeClient};
use crate::{crypto, email, file, query};
use crate::models::file::FileInfo;
use crate::handlers::utils;
use crate::handlers::utils::{disconnect_from_room, subtitles_id_in_room, video_id_in_room};
use crate::models::file::FileType;
use crate::models::mpv::{UserLoadedInfo, UserPause, UserPlayInfoClient};
use crate::models::playlist::{PlayingState, PlaylistEntry, RoomPlayInfo, RoomRuntimeState, UserPlayInfo, UserReadyStatus};
use crate::srvstate::{PlaylistEntryId, SrvState};

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
    s.on("get_sources", get_sources);
    s.on("get_files", get_files);
    s.on("add_video_files", add_video_files);
    s.on("add_urls", add_urls);
    s.on("add_subtitles_files", add_subtitles_files);
    s.on("req_playing_jwt", req_playing_jwt);
    s.on("change_active_video", change_active_video);
    s.on("set_playlist_order", set_playlist_order);
    s.on("delete_playlist_entry", delete_playlist_entry);
    s.on("mpv_file_loaded", mpv_file_loaded);
    s.on("mpv_file_load_failed", mpv_file_load_failed);
    s.on("user_ready_state_change", user_ready_state_change);
    s.on("user_file_load_retry", user_file_load_retry);
    s.on("mpv_play", mpv_play);
    s.on("mpv_pause", mpv_pause);

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
    if uid_opt.is_none() {
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

    let mut rid_opt: Option<Id> = None;
    {
        let rid_uids_rl = state.rid_uids.read().await;
        rid_opt = rid_uids_rl.get_by_right(&uid).map(|x|x.clone());
    }
    if let Some(rid) = rid_opt {
        disconnect_from_room(state, &s, uid, rid).await;
    }

    s.broadcast().emit("offline", uid).ok();

    println!("after disconnect");
    utils::debug_print(state);
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
    let uid = state.socket2uid(&s).await;
    s.broadcast().emit("online", uid).ok();
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
    } else {
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
    } else {
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
    s.within(payload.id.to_string()).emit("joined_room_playback_change", payload.playback_speed).ok();
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
    s.within(payload.id.to_string()).emit("joined_room_minor_desync_playback_slow", payload.minor_desync_playback_slow).ok();
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
    println!("before room join");
    utils::debug_print(state);

    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<JoinedRoomInfo>::err()).ok();
        return;
    }
    let mut transaction = state.db.begin().await.expect("db error");
    let room_exists = query::room_exists_for_update(&mut transaction, payload.rid)
        .await
        .expect("db error");
    if !room_exists {
        ack.send(SocketIoAck::<JoinedRoomInfo>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let old_connected_room_opt = state.socket_connected_room(&s).await;
    if old_connected_room_opt.is_some() {
        disconnect_from_room(state, &s, uid, old_connected_room_opt.unwrap()).await;
    }

    let mut uid_ping_wl = state.uid_ping.write().await;
    let mut rid_uids_wl = state.rid_uids.write().await;
    let mut uid2ready_status_wl = state.uid2ready_status.write().await;

    let new_room_name = payload.rid.to_string();
    let mut room_pings = HashMap::<Id, f64>::new();

    let room_settings = query::get_room_settings(&mut transaction, payload.rid)
        .await
        .expect("db error");

    let uids_already_in_room = rid_uids_wl.get_by_left(&payload.rid);
    if uids_already_in_room.is_none() {
        let mut rid2runtime_state_lock = state.rid2runtime_state.write().await;
        rid2runtime_state_lock.insert(payload.rid, RoomRuntimeState {
            playback_speed: room_settings.playback_speed,
            runtime_config: room_settings.clone()
        });
    }

    rid_uids_wl.insert(payload.rid, uid);
    uid_ping_wl.insert(uid, payload.ping);
    uid2ready_status_wl.insert(uid, UserReadyStatus::Loading);

    s.leave_all().ok();
    s.join(new_room_name.clone()).ok();

    let uids_in_room = rid_uids_wl.get_by_left(&payload.rid).unwrap();

    room_pings = uid_ping_wl
        .iter()
        .filter(|&(id, ping)| uids_in_room.contains(id))
        .map(|(id, ping)| (*id, *ping))
        .collect::<HashMap<Id, f64>>();

    s.to(new_room_name).emit("room_user_ping", RoomUserPingChange { uid, ping: payload.ping }).ok();

    if let Some(old_connected_room) = old_connected_room_opt {
        let urc = UserRoomChange { uid, old_rid: old_connected_room, new_rid: payload.rid };
        s.broadcast().emit("user_room_change", &urc).ok();
        s.emit("user_room_change", urc).ok();
    } else {
        let urj = UserRoomJoin { uid, rid: payload.rid };
        s.broadcast().emit("user_room_join", &urj).ok();
        s.emit("user_room_join", urj).ok();
    }

    let playlist_rl = state.playlist.read().await;
    let rid_video_id_rl = state.rid_video_id.read().await;
    let video_id2subtitles_ids_rl = state.video_id2subtitles_ids.read().await;

    let playlist_order = rid_video_id_rl
        .get_by_left(&payload.rid)
        .map(|x| x.clone())
        .unwrap_or(IndexSet::new());

    let mut playlist = playlist_order
        .iter()
        .map(|&id| (id, playlist_rl.get(&id).unwrap()))
        .collect::<HashMap<PlaylistEntryId, &PlaylistEntry>>();

    let mut subs_order = HashMap::<PlaylistEntryId, IndexSet<PlaylistEntryId>>::new();

    let mut playlist_subs = HashMap::<PlaylistEntryId, &PlaylistEntry>::new();
    for (video_entry_id, _) in &playlist {
        let subs_ids_opt = video_id2subtitles_ids_rl.get_by_left(video_entry_id);
        if subs_ids_opt.is_none() {
            subs_order.insert(*video_entry_id, IndexSet::new());
        }
        else {
            let subs_ids = subs_ids_opt.unwrap();
            for sub_id in subs_ids {
                let sub_entry = playlist_rl.get(sub_id).unwrap();
                playlist_subs.insert(*sub_id, sub_entry);
            }
            subs_order.insert(*video_entry_id, subs_ids_opt.unwrap().clone());
        }
    }

    playlist.extend(playlist_subs);

    let mut ready_status: HashMap<Id, UserReadyStatus> = HashMap::new();

    let room_uids = rid_uids_wl.get_by_left(&payload.rid).unwrap();
    for uid in room_uids {
        let r = uid2ready_status_wl.get(uid).unwrap();
        ready_status.insert(*uid, *r);
    }

    ack.send(SocketIoAck::<JoinedRoomInfo>::ok(Some(JoinedRoomInfo {
        room_settings,
        room_pings,
        playlist,
        playlist_order,
        subs_order,
        ready_status
    }))).ok();
    transaction.commit().await.expect("db error");

    println!("after room join");
    utils::debug_print(state);
}

pub async fn disconnect_room(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    println!("before room disconnect");
    utils::debug_print(state);

    let uid = state.socket2uid(&s).await;
    let connected_room_opt = state.socket_connected_room(&s).await;
    if connected_room_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = connected_room_opt.unwrap();
    {
        disconnect_from_room(state, &s, uid, rid).await;
    }
    let urd = UserRoomDisconnect { rid, uid };
    s.broadcast().emit("user_room_disconnect", &urd).ok();
    s.emit("user_room_disconnect", urd).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();

    println!("after room disconnect");
    utils::debug_print(state);
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
    s.to(room_name).emit("room_user_ping", RoomUserPingChange { uid, ping: payload.ping }).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_sources(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let mut m: IndexMap<&String, &String> = IndexMap::new();
    for (key, source) in &state.config.sources {
        m.insert(key, &source.client_url);
    }
    ack.send(m).ok();
}

pub async fn get_files(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<GetFilesInfo>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<Vec<FileInfo>>::err()).ok();
        return;
    }
    if !state.config.sources.contains_key(&payload.file_srv) {
        ack.send(SocketIoAck::<Vec<FileInfo>>::err()).ok();
        return;
    }
    let source = state.config.sources.get(&payload.file_srv).unwrap();
    let mut files = file::list(
        &source.list_root_url,
        &source.srv_jwt,
        &payload.path,
    )
        .await
        .expect("http error");

    let mut allowed_extensions_opt: Option<&HashSet<String>> = None;
    if payload.file_kind == FileKind::Video && state.config.extensions.videos.is_some() {
        allowed_extensions_opt = Some(&state.config.extensions.videos.as_ref().unwrap())
    } else if payload.file_kind == FileKind::Subtitles && state.config.extensions.subtitles.is_some() {
        allowed_extensions_opt = Some(&state.config.extensions.subtitles.as_ref().unwrap())
    }

    if let Some(allowed_extensions) = allowed_extensions_opt {
        files = files
            .iter()
            .filter(
                |&x| x.file_type == FileType::Directory || allowed_extensions.contains(x.name.split(".").last().unwrap())
            )
            .map(|x| x.clone())
            .collect::<Vec<FileInfo>>();
    }
    ack.send(SocketIoAck::<Vec<FileInfo>>::ok(Some(files))).ok();
}

pub async fn add_video_files(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<AddVideoFiles>,
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let mut v = Vec::<(&str, &str)>::new();
    for full_path in &payload.full_paths {
        let (source, path) = full_path.split_once(":").unwrap();
        if !state.config.sources.contains_key(source) {
            ack.send(SocketIoAck::<()>::err()).ok();
            return;
        }
        let source_info = state.config.sources.get(source).unwrap();
        let exists = file::f_exists(
            &source_info.list_root_url,
            &source_info.srv_jwt,
            path,
            &state.config.extensions.videos
        )
            .await
            .expect("http error");
        if !exists {
            ack.send(SocketIoAck::<()>::err()).ok();
            return;
        }
        v.push((source, path));
    }
    let mut rid_video_id_wl = state.rid_video_id.write().await;
    let mut playlist_wl = state.playlist.write().await;
    let mut send_entries: IndexMap<PlaylistEntryId, PlaylistEntry> = IndexMap::new();
    for (source, path) in v {
        let entry_id = state.next_playlist_entry_id().await;
        let entry = PlaylistEntry::Video { source: source.to_string(), path: path.to_string() };
        send_entries.insert(entry_id, entry.clone());
        playlist_wl.insert(entry_id, entry);
        rid_video_id_wl.insert(rid, entry_id);
    }

    s.within(rid.to_string()).emit("add_video_files", send_entries).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();

    drop(rid_video_id_wl);
    drop(playlist_wl);
    println!("\n\n\nafter adding_video_files");
    utils::debug_print(state);
}

pub async fn add_urls(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<AddUrls>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let mut rid_video_id_wl = state.rid_video_id.write().await;
    let mut playlist_wl = state.playlist.write().await;
    let mut send_entries: IndexMap<PlaylistEntryId, PlaylistEntry> = IndexMap::new();
    for url in payload.urls {
        let entry_id = state.next_playlist_entry_id().await;
        let entry = PlaylistEntry::Url { url };
        send_entries.insert(entry_id, entry.clone());
        playlist_wl.insert(entry_id, entry);
        rid_video_id_wl.insert(rid, entry_id);
    }
    s.within(rid.to_string()).emit("add_urls", send_entries).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();

    drop(rid_video_id_wl);
    drop(playlist_wl);
    println!("\n\n\nafter adding_urls");
    utils::debug_print(state);
}

pub async fn add_subtitles_files(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<AddSubtitlesFiles>,
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    if !video_id_in_room(state, rid, payload.video_id).await {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let mut v = Vec::<(&str, &str)>::new();
    for full_path in &payload.subs_full_paths {
        let (source, path) = full_path.split_once(":").unwrap();
        if !state.config.sources.contains_key(source) {
            ack.send(SocketIoAck::<()>::err()).ok();
            return;
        }
        let source_info = state.config.sources.get(source).unwrap();
        let exists = file::f_exists(
            &source_info.list_root_url,
            &source_info.srv_jwt,
            path,
            &state.config.extensions.subtitles
        )
            .await
            .expect("http error");
        if !exists {
            ack.send(SocketIoAck::<()>::err()).ok();
            return;
        }
        v.push((source, path));
    }

    let mut playlist_wl = state.playlist.write().await;
    let mut video_id2subtitles_ids_wl = state.video_id2subtitles_ids.write().await;
    let mut send_entries: IndexMap<PlaylistEntryId, PlaylistEntry> = IndexMap::new();

    for (source, path) in v {
        let entry_id = state.next_playlist_entry_id().await;
        let entry = PlaylistEntry::Subtitles { source: source.to_string(), path: path.to_string(), video_id: payload.video_id };
        send_entries.insert(entry_id, entry.clone());
        playlist_wl.insert(entry_id, entry);
        video_id2subtitles_ids_wl.insert(payload.video_id, entry_id);
    }

    s.within(rid.to_string()).emit("add_subtitles_files", send_entries).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();


    drop(playlist_wl);
    drop(video_id2subtitles_ids_wl);
    println!("\n\n\nafter add_subtitles_files update");
    utils::debug_print(state);
}

pub async fn req_playing_jwt(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaylistEntryIdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<String>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<String>::err()).ok();
        return;
    }

    let rid = rid_opt.unwrap();
    if !video_id_in_room(state, rid, payload.playlist_entry_id).await
        && !subtitles_id_in_room(state, rid, payload.playlist_entry_id).await {
        ack.send(SocketIoAck::<String>::err()).ok();
        return;
    }

    let playlist_rl = state.playlist.read().await;
    let entry = playlist_rl.get(&payload.playlist_entry_id).unwrap();
    if let PlaylistEntry::Url { .. } = entry {
        ack.send(SocketIoAck::<String>::err()).ok();
        return;
    }
    let mut s: &str;
    let mut p: &str;
    match entry {
        PlaylistEntry::Video { source, path } => {
            s = source;
            p = path;
        }
        PlaylistEntry::Subtitles { source, path, .. } => {
            s = source;
            p = path;
        }
        _ => {
            ack.send(SocketIoAck::<String>::err()).ok();
            return;
        }
    }
    let source = state.config.sources.get(s).unwrap();
    let jwt = file::gen_access_jwt(source, p)
        .await
        .expect("jwt signer error");

    ack.send(SocketIoAck::<String>::ok(Some(jwt))).ok();




    // TODO: check whether payload is currently playing video or subtitles of currently playing video

    // bla bla
    // TODO: check if JWT is required (not URL)
        // TODO: check if playing video or playing subtitles

    // TODO: change per room playing id
    // TODO change user playing id
    // TODO: respond to calling user with jwt / empty (url)
    // TODO: set hourglass to all
    // TODO: notify other users about the change, so that they call this function
}

pub async fn change_active_video(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaylistEntryIdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let rid = rid_opt.unwrap();
    if !video_id_in_room(state, rid, payload.playlist_entry_id).await {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let mut rid2play_info_wl = state.rid2play_info.write().await;
    let play_info_opt = rid2play_info_wl.get(&rid);
    if play_info_opt.is_some() && play_info_opt.unwrap().playing_entry_id == payload.playlist_entry_id {
        ack.send(SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    state.clear_uid2play_info_by_rid(rid).await;
    rid2play_info_wl.insert(
        rid,
        RoomPlayInfo {
            playing_entry_id: payload.playlist_entry_id,
            playing_state: PlayingState::Pause
        }
    );

    let mut uid2ready_status_wl = state.uid2ready_status.write().await;
    let rid_uids_rl = state.rid_uids.read().await;
    let uids = rid_uids_rl.get_by_left(&rid).unwrap();
    for uid in uids {
        uid2ready_status_wl.insert(*uid, UserReadyStatus::Loading);
    }

    ack.send(SocketIoAck::<()>::ok(None)).ok();
    s.within(rid.to_string()).emit("change_active_video", payload.playlist_entry_id).ok();

    drop(rid2play_info_wl);
    println!("after change_active_video");
    utils::debug_print(state);
}

pub async fn set_playlist_order(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaylistOrder>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let rid_video_id_rl = state.rid_video_id.read().await;
    for entry_id in &payload.playlist_order {
        let rid_of_entry_opt = rid_video_id_rl.get_by_right(entry_id);
        if rid_of_entry_opt.is_none() || *rid_of_entry_opt.unwrap() != rid {
            ack.send(SocketIoAck::<()>::err()).ok();
            return;
        }
    }
    drop(rid_video_id_rl);

    let mut rid_video_id_wl = state.rid_video_id.write().await;
    let order = rid_video_id_wl.get_by_left_mut(&rid).unwrap();

    order.clear();
    for id in &payload.playlist_order {
        order.insert(*id);
    }

    s.to(rid.to_string()).emit("playlist_order", [payload.playlist_order]).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();

    drop(rid_video_id_wl);
    println!("after playlist update");
    utils::debug_print(state);
}

pub async fn delete_playlist_entry(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaylistEntryIdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();

    let playlist_rl = state.playlist.read().await;
    let entry_opt = playlist_rl.get(&payload.playlist_entry_id);
    if entry_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    if let PlaylistEntry::Subtitles { .. } = entry_opt.unwrap() {
        drop(playlist_rl);

        if !subtitles_id_in_room(state, rid, payload.playlist_entry_id).await {
            ack.send(SocketIoAck::<()>::err()).ok();
            return;
        }

        state.remove_subtitles_entry(payload.playlist_entry_id).await;
    }
    else {
        drop(playlist_rl);

        if !video_id_in_room(state, rid, payload.playlist_entry_id).await {
            ack.send(SocketIoAck::<()>::err()).ok();
            return;
        }
        let mut rid2play_info_wl = state.rid2play_info.write().await;

        let room_play_info_opt = rid2play_info_wl.get(&rid);
        if let Some(room_play_info) = room_play_info_opt {
            if room_play_info.playing_entry_id == payload.playlist_entry_id {
                rid2play_info_wl.remove(&rid);
                state.clear_uid2play_info_by_rid(rid).await;
            }
        }
        state.remove_video_entry(payload.playlist_entry_id).await;
    }

    s.broadcast().emit("del_playlist_entry", payload.playlist_entry_id).ok();
    s.emit("del_playlist_entry", payload.playlist_entry_id).ok();
    ack.send(SocketIoAck::<()>::ok(None)).ok();

    println!("after delete_playlist_entry");
    utils::debug_print(state);
}

pub async fn mpv_file_loaded(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<UserLoadedInfo>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let mut uid2play_info_wl = state.uid2play_info.write().await;
    let mut uid2ready_status_wl = state.uid2ready_status.write().await;
    uid2play_info_wl.insert(
        uid,
        UserPlayInfo {
            aid: payload.aid,
            sid: payload.sid,
            audio_sync: payload.audio_sync,
            sub_sync: payload.sub_sync,
            timestamp: 0f64
        }
    );
    uid2ready_status_wl.insert(uid, UserReadyStatus::NotReady);

    s.within(rid.to_string()).emit(
        "user_play_info_changed",
              UserPlayInfoClient {
                  aid: payload.aid,
                  sid: payload.sid,
                  audio_sync: payload.audio_sync,
                  sub_sync: payload.sub_sync,
                  status: UserReadyStatus::NotReady,
                  uid
              }
    ).ok();

    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn mpv_file_load_failed(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let mut uid2ready_status_wl = state.uid2ready_status.write().await;
    let ready_status = uid2ready_status_wl.get_mut(&uid).unwrap();
    if *ready_status != UserReadyStatus::Loading {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    *ready_status = UserReadyStatus::Error;

    s
        .within(rid.to_string())
        .emit("user_file_load_failed", uid)
        .ok();

    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn user_ready_state_change(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<UserReadyStateChangeReq>,
) {
    if let Err(_) = payload.validate() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }

    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let mut uid2ready_status_wl = state.uid2ready_status.write().await;
    if let Some(rs) = uid2ready_status_wl.get_mut(&uid) {
        if *rs != payload.ready_state {
            *rs = payload.ready_state;

            s
                .to(rid.to_string())
                .emit("user_ready_state_change", UserReadyStateChangeClient {
                    uid,
                    ready_state: payload.ready_state
                }).ok();
        }

        ack.send(SocketIoAck::<()>::ok(None)).ok();
    }
    else {
        ack.send(SocketIoAck::<()>::err()).ok();
    }
}

pub async fn user_file_load_retry(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let mut uid2ready_status_wl = state.uid2ready_status.write().await;
    if let Some(rs) = uid2ready_status_wl.get_mut(&uid) {
        if *rs == UserReadyStatus::Error {
            *rs = UserReadyStatus::Loading;

            s
                .within(rid.to_string())
                .emit("user_file_load_retry", uid).ok();
        }

        ack.send(SocketIoAck::<()>::ok(None)).ok();
    }
    else {
        ack.send(SocketIoAck::<()>::err()).ok();
    }
}

pub async fn mpv_play(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    s
        .within(rid.to_string())
        .emit("mpv_play", uid).ok();

    ack.send(SocketIoAck::<()>::ok(None)).ok();
}

pub async fn mpv_pause(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<f64>,
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    s
        .within(rid.to_string())
        .emit("mpv_pause", UserPause { uid, timestamp: payload }).ok();

    ack.send(SocketIoAck::<()>::ok(None)).ok();
}