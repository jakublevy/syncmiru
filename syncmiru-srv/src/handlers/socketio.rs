use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use indexmap::{IndexMap, IndexSet};
use rust_decimal::Decimal;
use rust_decimal::prelude::ToPrimitive;
use socketioxide::extract::{AckSender, Data, SocketRef, State};
use tokio::time::Instant;
use validator::Validate;
use crate::models::{EmailWithLang, Tkn};
use crate::models::query::{EmailTknType, Id, RegDetail, RegTkn, RoomClient, RoomSettings, RoomsClientWOrder};
use crate::models::socketio::{IdStruct, Displayname, DisplaynameChange, SocketIoAck, EmailChangeTknType, EmailChangeTkn, ChangeEmail, AvatarBin, AvatarChange, Password, ChangePassword, Language, TknWithLang, RegTknCreate, RegTknName, PlaybackSpeed, DesyncTolerance, MajorDesyncMin, MinorDesyncPlaybackSlow, RoomName, RoomNameChange, RoomPlaybackSpeed, RoomDesyncTolerance, RoomMinorDesyncPlaybackSlow, RoomMajorDesyncMin, RoomOrder, JoinRoomReq, UserRoomChange, UserRoomJoin, UserRoomDisconnect, RoomPing, RoomUserPingChange, JoinedRoomInfo, GetFilesInfo, FileKind, AddVideoFiles, PlaylistEntryIdStruct, PlaylistOrder, AddUrls, UserReadyStateChangeReq, UserReadyStateChangeClient, AddEntryFilesResp, DeletePlaylistEntry, ChangePlaylistOrder, UploadMpvState, MpvState};
use crate::{crypto, email, file, query};
use crate::handlers::timers::DesyncTimerInterface;
use crate::models::file::FileInfo;
use crate::handlers::utils;
use crate::handlers::utils::{disconnect_from_room, video_id_in_room};
use crate::models::file::FileType;
use crate::models::mpv::{UserChangeAudio, UserChangeAudioDelay, UserChangeAudioSync, UserChangeSub, UserChangeSubDelay, UserChangeSubSync, UserLoadedInfo, UserPause, UserPlayInfoClient, UserSeek, UserSpeedChange, UserUploadMpvState};
use crate::srvstate::{PlayingState, PlaylistEntry, RoomPlayInfo, RoomRuntimeState, UserPlayInfo, UserReadyStatus, PlaylistEntryId, SrvState, TimestampInfo};

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
    s.on("mpv_seek", mpv_seek);
    s.on("mpv_speed_change", mpv_speed_change);
    s.on("change_audio_sync", change_audio_sync);
    s.on("change_sub_sync", change_sub_sync);
    s.on("mpv_audio_change", mpv_audio_change);
    s.on("mpv_sub_change", mpv_sub_change);
    s.on("mpv_audio_delay_change", mpv_audio_delay_change);
    s.on("mpv_sub_delay_change", mpv_sub_delay_change);
    s.on("mpv_upload_state", mpv_upload_state);
    s.on("user_change_aid", user_change_aid);
    s.on("user_change_sid", user_change_sid);
    s.on("user_change_audio_delay", user_change_audio_delay);
    s.on("user_change_sub_delay", user_change_sub_delay);
    s.on("timestamp_tick", timestamp_tick);
    s.on("get_mpv_state", get_mpv_state);

    let uid = state.socket2uid(&s).await;
    let user = query::get_user(&state.db, uid)
        .await
        .expect("db error");

    s.broadcast().emit("users", &user).ok();
    s.broadcast().emit("online", &uid).ok();
}

pub async fn disconnect(State(state): State<Arc<SrvState>>, s: SocketRef) {
    let uid_opt: Option<Id>;
    {
        let mut socket_uid_lock = state.socket_uid.write().await;
        uid_opt = socket_uid_lock.get_by_left(&s.id).map(|x| x.clone());
        socket_uid_lock.remove_by_left(&s.id);
    }
    let uid: Id;
    if uid_opt.is_none() {
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

    let mut rid_opt: Option<Id> = None;
    {
        let rid_uids_rl = state.rid_uids.read().await;
        rid_opt = rid_uids_rl.get_by_right(&uid).map(|x|x.clone());
    }
    if let Some(rid) = rid_opt {
        disconnect_from_room(&state, &s, uid, rid).await;

        let urd = UserRoomDisconnect { rid, uid };
        s.broadcast().emit("user_room_disconnect", &urd).ok();
    }

    s.broadcast().emit("offline", &uid).ok();
}

pub async fn get_users(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    let users = query::get_users(&state.db)
        .await
        .expect("db error");
    ack.send(&[users]).ok();
}

pub async fn get_me(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let uid = state.socket2uid(&s).await;
    ack.send(&uid).ok();
}

pub async fn get_online(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let online_uids_lock = state.socket_uid.read().await;
    let online_uids = online_uids_lock.right_values().collect::<Vec<&Id>>();
    ack.send(&[online_uids]).ok();
    let uid = state.socket2uid(&s).await;
    s.broadcast().emit("online", &uid).ok();
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
    s.emit("inactive_sessions", &[inactive_sessions]).ok();

    let active_session = query::get_active_user_session(
        &state.db,
        uid,
        &hwid_hash,
    )
        .await
        .expect("getting active user sessions failed");

    s.emit("active_session", &active_session).ok();
}

pub async fn delete_session(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let is_session_of_user = query::is_session_of_user(&state.db, payload.id, uid)
        .await
        .expect("db error");
    if !is_session_of_user {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let active_session = query::get_active_user_session(&state.db, uid, &state.socket2hwid_hash(&s).await)
        .await
        .expect("db error");
    if active_session.id == payload.id {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    query::delete_user_session(&state.db, payload.id)
        .await
        .expect("db error");
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
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
    ack.send(&email).ok();
}

pub async fn set_displayname(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Displayname>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    query::update_displayname_by_uid(&state.db, uid, &payload.displayname)
        .await
        .expect("db error");
    s
        .broadcast()
        .emit("displayname_change", &DisplaynameChange { uid, displayname: payload.displayname.clone() })
        .ok();

    s
        .emit("displayname_change", &DisplaynameChange { uid, displayname: payload.displayname })
        .ok();

    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_email_resend_timeout(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    ack.send(&(state.config.email.wait_before_resend + 1)).ok();
}

pub async fn get_reg_pub_allowed(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    ack.send(&state.config.reg_pub.allowed).ok();
}

pub async fn send_email_change_verification_emails(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<EmailWithLang>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;

    let out_of_quota = utils::is_change_email_out_of_quota(&state, uid)
        .await
        .expect("change_email_out_of_quota error");
    if out_of_quota {
        ack.send(&SocketIoAck::<()>::err()).ok();
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
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn check_email_change_tkn(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<EmailChangeTkn>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
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

    ack.send(&SocketIoAck::<bool>::ok(Some(tkn_valid))).ok();
}

pub async fn change_email(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<ChangeEmail>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
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
        ack.send(&SocketIoAck::<()>::err()).ok();
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
        ack.send(&SocketIoAck::<()>::err()).ok();
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
        ack.send(&SocketIoAck::<()>::err()).ok();
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
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
    transaction.commit().await.expect("db error");
}

pub async fn set_avatar(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<AvatarBin>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    query::update_avatar_by_uid(&state.db, uid, &payload.data)
        .await
        .expect("db error");

    s
        .broadcast()
        .emit("avatar_change", &AvatarChange { uid, avatar: payload.data.clone() })
        .ok();

    s
        .emit("avatar_change", &AvatarChange { uid, avatar: payload.data })
        .ok();

    ack.send(&SocketIoAck::<()>::ok(None)).ok();
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
        .emit("avatar_change", &AvatarChange { uid, avatar: vec![] })
        .ok();

    s
        .emit("avatar_change", &AvatarChange { uid, avatar: vec![] })
        .ok();
    ack.send(&{}).ok();
}

pub async fn check_password(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Password>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<bool>::ok(Some(false))).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let password_hash = query::get_user_hash_unsafe(&state.db, uid)
        .await
        .expect("db error");
    if crypto::verify(payload.password, password_hash).await.expect("argon2 error") {
        ack.send(&SocketIoAck::<bool>::ok(Some(true))).ok();
        return;
    }
    ack.send(&SocketIoAck::<bool>::ok(Some(false))).ok();
}

pub async fn change_password(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<ChangePassword>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let password_hash = query::get_user_hash_unsafe(&state.db, uid)
        .await
        .expect("db error");
    if crypto::verify(payload.old_password, password_hash).await.expect("argon2 error") {
        let email = query::get_email_by_uid(&state.db, uid)
            .await
            .expect("db error");
        let new_hash = crypto::hash(payload.new_password)
            .await
            .expect("argon2 error");
        query::update_password_by_uid(&state.db, uid, &new_hash)
            .await
            .expect("db error");
        email::send_password_changed_warning(
            &state.config.email,
            &email,
            &state.config.srv.url,
            &payload.lang
        )
            .await
            .expect("email error");

        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn send_delete_account_email(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Language>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let email = query::get_email_by_uid(&state.db, uid)
        .await
        .expect("db error");

    let within_quota = utils::check_email_tkn_within_quota(
        &state, uid, EmailTknType::DeleteAccount,
    )
        .await
        .expect("check_email_tkn quota error");
    if !within_quota {
        ack.send(&SocketIoAck::<()>::err()).ok();
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

    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn check_delete_account_tkn(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Tkn>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
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
        ack.send(&SocketIoAck::<bool>::ok(Some(false))).ok();
        return;
    }
    let hashed_tkn = hashed_tkn_opt.unwrap();

    let tkn_valid = crypto::verify(payload.tkn, hashed_tkn)
        .await
        .expect("argon2 error");

    ack.send(&SocketIoAck::<bool>::ok(Some(tkn_valid))).ok();
}

pub async fn delete_account(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<TknWithLang>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
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
        ack.send(&SocketIoAck::<bool>::ok(Some(false))).ok();
        return;
    }
    let hashed_tkn = hashed_tkn_opt.unwrap();

    let tkn_valid = crypto::verify(payload.tkn, hashed_tkn)
        .await
        .expect("argon2 error");

    if !tkn_valid {
        ack.send(&SocketIoAck::<bool>::ok(Some(false))).ok();
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

    s.broadcast().emit("del_users", &[[uid]]).ok();

    email::send_account_deleted_email_warning(
        &state.config.email,
        &email,
        &username,
        &state.config.srv.url,
        &payload.lang,
    )
        .await
        .expect("email error");
    ack.send(&SocketIoAck::<bool>::ok(Some(true))).ok();
}

pub async fn create_reg_tkn(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RegTknCreate>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let unique = query::reg_tkn_name_unique(&state.db, &payload.reg_tkn_name)
        .await
        .expect("db error");
    if !unique {
        ack.send(&SocketIoAck::<()>::err()).ok();
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

    s.emit("active_reg_tkns", &[[&reg_tkn]]).ok();
    s.broadcast().emit("active_reg_tkns", &[[reg_tkn]]).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn active_reg_tkns(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    let active_reg_tkns = query::get_active_reg_tkns(&state.db)
        .await
        .expect("db error");
    ack.send(&[active_reg_tkns]).ok();
}

pub async fn inactive_reg_tkns(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    let inactive_reg_tkns = query::get_inactive_reg_tkns(&state.db)
        .await
        .expect("db error");
    ack.send(&[inactive_reg_tkns]).ok();
}

pub async fn check_reg_tkn_name_unique(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
    Data(payload): Data<RegTknName>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<bool>::err()).ok();
        return;
    }
    let unique = query::reg_tkn_name_unique(&state.db, &payload.reg_tkn_name)
        .await
        .expect("db error");
    ack.send(&SocketIoAck::<bool>::ok(Some(unique))).ok();
}

pub async fn delete_reg_tkn(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
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

        s.broadcast().emit("del_active_reg_tkns", &[[payload.id]]).ok();
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        transaction
            .commit()
            .await
            .expect("db error");
    }
    else {
        ack.send(&SocketIoAck::<()>::err()).ok();
    }
}

pub async fn get_reg_tkn_info(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<Vec<RegDetail>>::err()).ok();
        return;
    }
    let tkn_detail = query::get_reg_tkn_info(&state.db, payload.id)
        .await
        .expect("db error");
    ack.send(&SocketIoAck::<Vec<RegDetail>>::ok(Some(tkn_detail))).ok();
}

pub async fn get_default_playback_speed(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    let default_playback_speed = query::get_default_playback_speed(&state.db)
        .await
        .expect("db error");
    ack.send(&SocketIoAck::<Decimal>::ok(Some(default_playback_speed))).ok();
}

pub async fn set_default_playback_speed(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaybackSpeed>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_default_playback_speed(&state.db, &payload.playback_speed)
        .await
        .expect("db error");

    s.broadcast().emit("default_playback_speed", &payload.playback_speed).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_default_desync_tolerance(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    let default_desync_tolerance = query::get_default_desync_tolerance(&state.db)
        .await
        .expect("db error");
    ack.send(&SocketIoAck::<Decimal>::ok(Some(default_desync_tolerance))).ok();
}

pub async fn set_default_desync_tolerance(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<DesyncTolerance>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_default_desync_tolerance(&state.db, &payload.desync_tolerance)
        .await
        .expect("db error");

    s.broadcast().emit("default_desync_tolerance", &payload.desync_tolerance).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_default_major_desync_min(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    let default_major_desync_min = query::get_default_major_desync_min(&state.db)
        .await
        .expect("db error");
    ack.send(&SocketIoAck::<Decimal>::ok(Some(default_major_desync_min))).ok();
}

pub async fn set_default_major_desync_min(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<MajorDesyncMin>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_default_major_desync_min(&state.db, &payload.major_desync_min)
        .await
        .expect("db error");

    s.broadcast().emit("default_major_desync_min", &payload.major_desync_min).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_default_minor_desync_playback_slow(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    let minor_desync_playback_slow = query::get_default_minor_desync_playback_slow(&state.db)
        .await
        .expect("db error");
    ack.send(&SocketIoAck::<Decimal>::ok(Some(minor_desync_playback_slow))).ok();
}

pub async fn set_default_minor_desync_playback_slow(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<MinorDesyncPlaybackSlow>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_default_minor_desync_playback_slow(&state.db, &payload.minor_desync_playback_slow)
        .await
        .expect("db error");

    s.broadcast().emit("default_minor_desync_playback_slow", &payload.minor_desync_playback_slow).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn check_room_name_unique(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
    Data(payload): Data<RoomName>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<bool>::err()).ok();
        return;
    }
    let unique = query::room_name_unique(&state.db, &payload.room_name)
        .await
        .expect("db error");
    ack.send(&SocketIoAck::<bool>::ok(Some(unique))).ok();
}

pub async fn create_room(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomName>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let unique = query::room_name_unique(&state.db, &payload.room_name)
        .await
        .expect("db error");
    if !unique {
        ack.send(&SocketIoAck::<()>::err()).ok();
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
    s.broadcast().emit("rooms", &[[&room]]).ok();
    s.emit("rooms", &[[&room]]).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();

    transaction
        .commit()
        .await
        .expect("db error");
}

pub async fn get_rooms(
    State(state): State<Arc<SrvState>>,
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
    ack.send(&rooms_w_order).ok();
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
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_room_name(&state.db, payload.rid, &payload.room_name)
        .await
        .expect("db error");

    s.broadcast().emit("room_name_change", &[[&payload]]).ok();
    s.emit("room_name_change", &[[payload]]).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn delete_room(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
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
        s.broadcast().emit("del_rooms", &[[payload.id]]).ok();
        s.emit("del_rooms", &[[payload.id]]).ok();
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        transaction
            .commit()
            .await
            .expect("db error");
    }
    else {
        ack.send(&SocketIoAck::<()>::err()).ok();
    }
}

pub async fn get_room_playback_speed(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let playback_speed_opt = query::get_room_playback_speed(&state.db, payload.id)
        .await
        .expect("db error");
    if playback_speed_opt.is_none() {
        ack.send(&SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let playback_speed = playback_speed_opt.unwrap();
    ack.send(&SocketIoAck::<Decimal>::ok(Some(playback_speed))).ok();
}

pub async fn set_room_playback_speed(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomPlaybackSpeed>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let updated = query::set_room_playback_speed(&state.db, payload.id, &payload.playback_speed)
        .await
        .expect("db error");

    if !updated {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    s.broadcast().emit("room_playback_speed", &payload).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_room_desync_tolerance(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let desync_tolerance_opt = query::get_room_desync_tolerance(&state.db, payload.id)
        .await
        .expect("db error");
    if desync_tolerance_opt.is_none() {
        ack.send(&SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let desync_tolerance = desync_tolerance_opt.unwrap();
    ack.send(&SocketIoAck::<Decimal>::ok(Some(desync_tolerance))).ok();
}

pub async fn set_room_desync_tolerance(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomDesyncTolerance>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let updated = query::set_room_desync_tolerance(&state.db, payload.id, &payload.desync_tolerance)
        .await
        .expect("db error");

    if !updated {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    s.broadcast().emit("room_desync_tolerance", &payload).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_room_minor_desync_playback_slow(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let room_minor_desync_playback_slow_opt = query::get_room_minor_desync_playback_slow(&state.db, payload.id)
        .await
        .expect("db error");
    if room_minor_desync_playback_slow_opt.is_none() {
        ack.send(&SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let room_minor_desync_playback_slow = room_minor_desync_playback_slow_opt.unwrap();
    ack.send(&SocketIoAck::<Decimal>::ok(Some(room_minor_desync_playback_slow))).ok();
}

pub async fn set_room_minor_desync_playback_slow(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomMinorDesyncPlaybackSlow>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let updated = query::set_room_minor_desync_playback_slow(&state.db, payload.id, &payload.minor_desync_playback_slow)
        .await
        .expect("db error");

    if !updated {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    s.broadcast().emit("room_minor_desync_playback_slow", &payload).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_room_major_desync_min(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
    Data(payload): Data<IdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let room_major_desync_min_opt = query::get_room_major_desync_min(&state.db, payload.id)
        .await
        .expect("db error");
    if room_major_desync_min_opt.is_none() {
        ack.send(&SocketIoAck::<Decimal>::err()).ok();
        return;
    }
    let room_major_desync_min = room_major_desync_min_opt.unwrap();
    ack.send(&SocketIoAck::<Decimal>::ok(Some(room_major_desync_min))).ok();
}

pub async fn set_room_major_desync_min(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomMajorDesyncMin>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let updated = query::set_room_major_desync_min(&state.db, payload.id, &payload.major_desync_min)
        .await
        .expect("db error");

    if !updated {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    s.broadcast().emit("room_major_desync_min", &payload).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn set_room_order(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomOrder>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let mut transaction = state.db.begin().await.expect("db error");
    let valid = query::room_order_valid(&mut transaction, &payload.room_order)
        .await
        .expect("db error");
    if !valid {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    query::set_room_order(&mut transaction, &payload.room_order)
        .await
        .expect("db error");

    s.broadcast().emit("room_order", &[payload.room_order]).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
    transaction
        .commit()
        .await
        .expect("db error");
}

pub async fn ping(
    ack: AckSender,
) {
    ack.send(&{}).ok();
}

pub async fn join_room(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<JoinRoomReq>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<JoinedRoomInfo>::err()).ok();
        return;
    }
    let mut transaction = state.db.begin().await.expect("db error");
    let room_exists = query::room_exists_for_update(&mut transaction, payload.rid)
        .await
        .expect("db error");
    if !room_exists {
        ack.send(&SocketIoAck::<JoinedRoomInfo>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    let old_connected_room_opt = state.socket_connected_room(&s).await;
    if old_connected_room_opt.is_some() {
        disconnect_from_room(&state, &s, uid, old_connected_room_opt.unwrap()).await;
    }

    let mut uid_ping_wl = state.uid_ping.write().await;
    let mut rid_uids_wl = state.rid_uids.write().await;
    let mut uid2ready_status_wl = state.uid2ready_status.write().await;

    let new_room_name = payload.rid.to_string();
    let mut room_pings = HashMap::<Id, f64>::new();

    let room_settings_db = query::get_room_settings(&mut transaction, payload.rid)
        .await
        .expect("db error");

    let mut room_settings = room_settings_db.clone();

    let uids_already_in_room = rid_uids_wl.get_by_left(&payload.rid);
    if uids_already_in_room.is_none() {
        let mut rid2runtime_state_lock = state.rid2runtime_state.write().await;
        rid2runtime_state_lock.insert(payload.rid, RoomRuntimeState {
            playback_speed: room_settings_db.playback_speed,
            runtime_config: room_settings_db.clone()
        });
    }
    else {
        let rid2runtime_state_rl = state.rid2runtime_state.read().await;
        let room_runtime_settings = rid2runtime_state_rl.get(&payload.rid).unwrap();
        room_settings = RoomSettings {
            playback_speed: room_runtime_settings.runtime_config.playback_speed,
            major_desync_min: room_runtime_settings.runtime_config.major_desync_min,
            minor_desync_playback_slow: room_runtime_settings.runtime_config.minor_desync_playback_slow,
            desync_tolerance: room_runtime_settings.runtime_config.desync_tolerance
        }
    }

    let uid2play_info_rl = state.uid2play_info.read().await;
    let mut users_audio_sub = HashMap::<Id, UserPlayInfo>::new();
    if let Some(uids) = uids_already_in_room {
        for uid in uids {
            let play_info_opt = uid2play_info_rl.get(uid);
            if let Some(play_info) = play_info_opt {
                users_audio_sub.insert(*uid, *play_info);
            }
        }
    }

    rid_uids_wl.insert(payload.rid, uid);
    uid_ping_wl.insert(uid, payload.ping);
    uid2ready_status_wl.insert(uid, UserReadyStatus::Loading);

    s.leave_all().ok();
    s.join(new_room_name.clone()).ok();

    let uids_in_room = rid_uids_wl.get_by_left(&payload.rid).unwrap();

    room_pings = uid_ping_wl
        .iter()
        .filter(|&(id, _)| uids_in_room.contains(id))
        .map(|(id, ping)| (*id, *ping))
        .collect::<HashMap<Id, f64>>();

    s.to(new_room_name).emit("room_user_ping", &RoomUserPingChange { uid, ping: payload.ping }).ok();

    if let Some(old_connected_room) = old_connected_room_opt {
        let urc = UserRoomChange { uid, old_rid: old_connected_room, new_rid: payload.rid };
        s.broadcast().emit("user_room_change", &urc).ok();
        s.emit("user_room_change", &urc).ok();
    }
    else {
        let urj = UserRoomJoin { uid, rid: payload.rid };
        s.broadcast().emit("user_room_join", &urj).ok();
        s.emit("user_room_join", &urj).ok();
    }

    let playlist_rl = state.playlist.read().await;
    let rid_video_id_rl = state.rid_video_id.read().await;

    let playlist_order = rid_video_id_rl
        .get_by_left(&payload.rid)
        .map(|x| x.clone())
        .unwrap_or(IndexSet::new());

    let playlist = playlist_order
        .iter()
        .map(|&id| (id, playlist_rl.get(&id).unwrap()))
        .collect::<HashMap<PlaylistEntryId, &PlaylistEntry>>();

    let mut ready_status: HashMap<Id, UserReadyStatus> = HashMap::new();

    let room_uids = rid_uids_wl.get_by_left(&payload.rid).unwrap();
    for uid in room_uids {
        let r = uid2ready_status_wl.get(uid).unwrap();
        ready_status.insert(*uid, *r);
    }

    let rid2play_info_rl = state.rid2play_info.read().await;
    let mut active_video_id: Option<PlaylistEntryId> = None;
    if let Some(room_play_info) = rid2play_info_rl.get(&payload.rid) {
        active_video_id = Some(room_play_info.playing_entry_id);
    }

    ack.send(&SocketIoAck::<JoinedRoomInfo>::ok(Some(JoinedRoomInfo {
        room_settings,
        room_pings,
        playlist,
        playlist_order,
        ready_status,
        active_video_id,
        users_audio_sub
    }))).ok();
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
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    let rid = connected_room_opt.unwrap();
    {
        disconnect_from_room(&state, &s, uid, rid).await;
    }
    let urd = UserRoomDisconnect { rid, uid };
    s.broadcast().emit("user_room_disconnect", &urd).ok();
    s.emit("user_room_disconnect", &urd).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_room_users(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    let rid_uids_lock = state.rid_uids.read().await;
    let rid2uids = rid_uids_lock.get_key_to_values_hashmap().clone();
    ack.send(&rid2uids).ok();
}

pub async fn room_ping(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<RoomPing>,
) {
    let connected_room_opt = state.socket_connected_room(&s).await;
    if connected_room_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    {
        let mut uid_ping_lock = state.uid_ping.write().await;
        uid_ping_lock.insert(uid, payload.ping);
    }
    let room_name = connected_room_opt.unwrap().to_string();
    s.to(room_name).emit("room_user_ping", &RoomUserPingChange { uid, ping: payload.ping }).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn get_sources(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
) {
    let mut m: IndexMap<&String, &String> = IndexMap::new();
    for (key, source) in &state.config.sources {
        m.insert(key, &source.client_url);
    }
    ack.send(&m).ok();
}

pub async fn get_files(
    State(state): State<Arc<SrvState>>,
    ack: AckSender,
    Data(payload): Data<GetFilesInfo>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<Vec<FileInfo>>::err()).ok();
        return;
    }
    if !state.config.sources.contains_key(&payload.file_srv) {
        ack.send(&SocketIoAck::<Vec<FileInfo>>::err()).ok();
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
    ack.send(&SocketIoAck::<Vec<FileInfo>>::ok(Some(files))).ok();
}

pub async fn add_video_files(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<AddVideoFiles>,
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;

    let mut v = Vec::<(&str, &str)>::new();
    for full_path in &payload.full_paths {
        let (source, path) = full_path.split_once(":").unwrap();
        if !state.config.sources.contains_key(source) {
            ack.send(&SocketIoAck::<()>::err()).ok();
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
            ack.send(&SocketIoAck::<()>::err()).ok();
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

    s.within(rid.to_string()).emit("add_video_files", &AddEntryFilesResp { uid, entries: send_entries }).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();

    drop(rid_video_id_wl);
    drop(playlist_wl);
}

pub async fn add_urls(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<AddUrls>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;

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
    s.within(rid.to_string()).emit("add_urls", &AddEntryFilesResp { uid, entries: send_entries }).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();

    drop(rid_video_id_wl);
    drop(playlist_wl);
}

pub async fn req_playing_jwt(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaylistEntryIdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<String>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<String>::err()).ok();
        return;
    }

    let rid = rid_opt.unwrap();
    if !video_id_in_room(&state, rid, payload.playlist_entry_id).await {
        ack.send(&SocketIoAck::<String>::err()).ok();
        return;
    }

    let playlist_rl = state.playlist.read().await;
    let entry = playlist_rl.get(&payload.playlist_entry_id).unwrap();
    if let PlaylistEntry::Url { .. } = entry {
        ack.send(&SocketIoAck::<String>::err()).ok();
        return;
    }
    let s: &str;
    let p: &str;
    match entry {
        PlaylistEntry::Video { source, path } => {
            s = source;
            p = path;
        }
        _ => {
            ack.send(&SocketIoAck::<String>::err()).ok();
            return;
        }
    }
    let source = state.config.sources.get(s).unwrap();
    let jwt = file::gen_access_jwt(source, p)
        .await
        .expect("jwt signer error");

    ack.send(&SocketIoAck::<String>::ok(Some(jwt))).ok();
}

pub async fn change_active_video(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaylistEntryIdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }

    let rid = rid_opt.unwrap();
    if !video_id_in_room(&state, rid, payload.playlist_entry_id).await {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let mut rid2play_info_wl = state.rid2play_info.write().await;
    let play_info_opt = rid2play_info_wl.get(&rid);
    if play_info_opt.is_some() && play_info_opt.unwrap().playing_entry_id == payload.playlist_entry_id {
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    state.clear_uid2play_info_by_rid(rid).await;
    rid2play_info_wl.insert(
        rid,
        RoomPlayInfo {
            playing_entry_id: payload.playlist_entry_id,
            playing_state: PlayingState::Pause,
            last_change_at: Instant::now()
        }
    );

    let mut rid2runtime_state_wl = state.rid2runtime_state.write().await;
    let room_runtime_state = rid2runtime_state_wl.get_mut(&rid).unwrap();
    room_runtime_state.playback_speed = room_runtime_state.runtime_config.playback_speed;

    let mut uid2ready_status_wl = state.uid2ready_status.write().await;
    let mut uid2timestamp_wl = state.uid2timestamp.write().await;
    let rid_uids_rl = state.rid_uids.read().await;
    let uids = rid_uids_rl.get_by_left(&rid).unwrap();
    for uid in uids {
        uid2ready_status_wl.insert(*uid, UserReadyStatus::Loading);
        uid2timestamp_wl.remove(uid);
    }

    ack.send(&SocketIoAck::<()>::ok(None)).ok();
    s.within(rid.to_string()).emit("change_active_video", &payload.playlist_entry_id).ok();

    drop(rid2play_info_wl);
}

pub async fn set_playlist_order(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaylistOrder>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let rid_video_id_rl = state.rid_video_id.read().await;
    for entry_id in &payload.playlist_order {
        let rid_of_entry_opt = rid_video_id_rl.get_by_right(entry_id);
        if rid_of_entry_opt.is_none() || *rid_of_entry_opt.unwrap() != rid {
            ack.send(&SocketIoAck::<()>::err()).ok();
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

    s.to(rid.to_string()).emit("playlist_order", &ChangePlaylistOrder { uid, order: payload.playlist_order }).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();

    drop(rid_video_id_wl);
}

pub async fn delete_playlist_entry(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<PlaylistEntryIdStruct>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let playlist_rl = state.playlist.read().await;
    let entry_opt = playlist_rl.get(&payload.playlist_entry_id);
    if entry_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }

    drop(playlist_rl);

    if !video_id_in_room(&state, rid, payload.playlist_entry_id).await {
        ack.send(&SocketIoAck::<()>::err()).ok();
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

    s.within(rid.to_string()).emit("del_playlist_entry", &DeletePlaylistEntry { uid, entry_id: payload.playlist_entry_id }).ok();
    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn mpv_file_loaded(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<UserLoadedInfo>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
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
            audio_delay: 0f64,
            sub_delay: 0f64
        }
    );
    uid2ready_status_wl.insert(uid, UserReadyStatus::NotReady);

    state.desync_timer_tx.send(DesyncTimerInterface::Wake).await.ok();

    s.within(rid.to_string()).emit(
        "user_file_loaded",
        &UserPlayInfoClient {
            aid: payload.aid,
            sid: payload.sid,
            audio_sync: payload.audio_sync,
            sub_sync: payload.sub_sync,
            status: UserReadyStatus::NotReady,
            audio_delay: 0f64,
            sub_delay: 0f64,
            uid
        }
    ).ok();

    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn mpv_file_load_failed(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let mut uid2ready_status_wl = state.uid2ready_status.write().await;
    let ready_status = uid2ready_status_wl.get_mut(&uid).unwrap();
    if *ready_status != UserReadyStatus::Loading {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    *ready_status = UserReadyStatus::Error;

    s
        .within(rid.to_string())
        .emit("user_file_load_failed", &uid)
        .ok();

    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn user_ready_state_change(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<UserReadyStateChangeReq>,
) {
    if let Err(_) = payload.validate() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }

    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let mut uid2ready_status_wl = state.uid2ready_status.write().await;
    if let Some(rs) = uid2ready_status_wl.get_mut(&uid) {
        if *rs != payload.ready_state {
            *rs = payload.ready_state;

            s
                .within(rid.to_string())
                .emit("user_ready_state_change", &UserReadyStateChangeClient {
                    uid,
                    ready_state: payload.ready_state
                }).ok();
        }

        ack.send(&SocketIoAck::<()>::ok(None)).ok();
    }
    else {
        ack.send(&SocketIoAck::<()>::err()).ok();
    }
}

pub async fn user_file_load_retry(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
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
                .emit("user_file_load_retry", &uid).ok();
        }

        ack.send(&SocketIoAck::<()>::ok(None)).ok();
    }
    else {
        ack.send(&SocketIoAck::<()>::err()).ok();
    }
}

pub async fn mpv_play(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        let mut rid2play_info_wl = state.rid2play_info.write().await;
        let play_info = rid2play_info_wl.get_mut(&rid).unwrap();
        play_info.playing_state = PlayingState::Play;
        play_info.last_change_at = Instant::now();

        s
            .within(rid.to_string())
            .emit("mpv_play", &uid).ok();

        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn mpv_pause(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<f64>,
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        let mut uid2timestamp_wl = state.uid2timestamp.write().await;
        let mut uid2minor_desync_wl = state.uid2minor_desync.write().await;
        let rid_uids_rl = state.rid_uids.read().await;
        let mut rid2play_info_wl = state.rid2play_info.write().await;
        let now = Instant::now();
        let play_info = rid2play_info_wl.get_mut(&rid).unwrap();
        play_info.playing_state = PlayingState::Pause;
        play_info.last_change_at = Instant::now();

        let uids = rid_uids_rl.get_by_left(&rid).unwrap();
        for uid in uids {
            if uid2minor_desync_wl.remove(uid) {
                let io_rl = state.io.read().await;
                let io = io_rl.as_ref().unwrap();
                if let Some(sid) = state.uid2sid(*uid).await {
                    if let Some(target_socket) = io.get_socket(sid) {
                        target_socket.emit("minor_desync_stop", &{}).ok();
                    }
                }
            }
            uid2timestamp_wl.insert(*uid, TimestampInfo { timestamp: payload, recv: now });
        }

        s
            .within(rid.to_string())
            .emit("mpv_pause", &UserPause { uid, timestamp: payload }).ok();

        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn mpv_seek(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<f64>,
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let mut uid2timestamp_wl = state.uid2timestamp.write().await;
    let mut uid2minor_desync_wl = state.uid2minor_desync.write().await;

    if state.user_file_loaded(uid).await {
        let rid_uids_rl = state.rid_uids.read().await;
        let now = Instant::now();
        let uids = rid_uids_rl.get_by_left(&rid).unwrap();
        for uid in uids {
            if uid2minor_desync_wl.remove(uid) {
                let io_rl = state.io.read().await;
                let io = io_rl.as_ref().unwrap();
                if let Some(sid) = state.uid2sid(*uid).await {
                    if let Some(target_socket) = io.get_socket(sid) {
                        target_socket.emit("minor_desync_stop", &{}).ok();
                    }
                }
            }
            uid2timestamp_wl.insert(*uid, TimestampInfo { timestamp: payload, recv: now });
        }

        s
            .within(rid.to_string())
            .emit("mpv_seek", &UserSeek { uid, timestamp: payload }).ok();

        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn mpv_speed_change(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Decimal>,
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        let mut rid2runtime_state_wl = state.rid2runtime_state.write().await;
        let runtime_state = rid2runtime_state_wl.get_mut(&rid).unwrap();
        runtime_state.playback_speed = payload;
        state.clear_minor_desync_uids_for_rid(rid).await;

        s
            .within(rid.to_string())
            .emit("mpv_speed_change", &UserSpeedChange { uid, speed: payload }).ok();

        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn change_audio_sync(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<bool>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let mut uid2play_info_wl = state.uid2play_info.write().await;
    if let Some(user_play_info) = uid2play_info_wl.get_mut(&uid) {
        user_play_info.audio_sync = payload;
        s.to(rid.to_string()).emit("change_audio_sync", &UserChangeAudioSync { uid, audio_sync: payload }).ok();
    }

    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn change_sub_sync(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<bool>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    let mut uid2play_info_wl = state.uid2play_info.write().await;
    if let Some(user_play_info) = uid2play_info_wl.get_mut(&uid) {
        user_play_info.sub_sync = payload;
        s.to(rid.to_string()).emit("change_sub_sync", &UserChangeSubSync { uid, sub_sync: payload }).ok();
    }

    ack.send(&SocketIoAck::<()>::ok(None)).ok();
}

pub async fn mpv_audio_change(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Option<u64>>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        s.within(rid.to_string()).emit("mpv_audio_change", &UserChangeAudio { aid: payload, uid }).ok();
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn mpv_sub_change(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Option<u64>>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        s.within(rid.to_string()).emit("mpv_sub_change", &UserChangeSub { sid: payload, uid }).ok();
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn mpv_audio_delay_change(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<f64>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        s.within(rid.to_string()).emit("mpv_audio_delay_change", &UserChangeAudioDelay { audio_delay: payload, uid }).ok();
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn mpv_sub_delay_change(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<f64>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        s.within(rid.to_string()).emit("mpv_sub_delay_change", &UserChangeSubDelay { sub_delay: payload, uid }).ok();
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn mpv_upload_state(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<UploadMpvState>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        s.within(rid.to_string()).emit("mpv_upload_state", &UserUploadMpvState {
            uid,
            aid: payload.aid,
            sid: payload.sid,
            audio_delay: payload.audio_delay,
            sub_delay: payload.sub_delay
        }).ok();
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn user_change_aid(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Option<u64>>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        let mut uid2play_info_wl = state.uid2play_info.write().await;
        let play_info = uid2play_info_wl.get_mut(&uid).unwrap();
        if play_info.aid != payload {
            play_info.aid = payload;
            s.within(rid.to_string()).emit("user_change_aid", &UserChangeAudio { uid, aid: payload }).ok();
        }
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn user_change_sid(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<Option<u64>>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        let mut uid2play_info_wl = state.uid2play_info.write().await;
        let play_info = uid2play_info_wl.get_mut(&uid).unwrap();
        if play_info.sid != payload {
            play_info.sid = payload;
            s.within(rid.to_string()).emit("user_change_sid", &UserChangeSub { uid, sid: payload }).ok();
        }
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn user_change_audio_delay(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<f64>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        let mut uid2play_info_wl = state.uid2play_info.write().await;
        let play_info = uid2play_info_wl.get_mut(&uid).unwrap();
        if play_info.audio_delay != payload {
            play_info.audio_delay = payload;
            s.within(rid.to_string()).emit("user_change_audio_delay", &UserChangeAudioDelay { uid, audio_delay: payload }).ok();
        }
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn user_change_sub_delay(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<f64>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;

    if state.user_file_loaded(uid).await {
        let mut uid2play_info_wl = state.uid2play_info.write().await;
        let play_info = uid2play_info_wl.get_mut(&uid).unwrap();
        if play_info.sub_delay != payload {
            play_info.sub_delay = payload;
            s.within(rid.to_string()).emit("user_change_sub_delay", &UserChangeSubDelay { uid, sub_delay: payload }).ok();
        }
        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn timestamp_tick(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender,
    Data(payload): Data<f64>
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<()>::err()).ok();
        return;
    }
    let uid = state.socket2uid(&s).await;
    if state.user_file_loaded(uid).await {
        let mut uid2timestamp_wl = state.uid2timestamp.write().await;
        uid2timestamp_wl.insert(uid, TimestampInfo{ timestamp: payload, recv: Instant::now() });

        ack.send(&SocketIoAck::<()>::ok(None)).ok();
        return;
    }
    ack.send(&SocketIoAck::<()>::err()).ok();
}

pub async fn get_mpv_state(
    State(state): State<Arc<SrvState>>,
    s: SocketRef,
    ack: AckSender
) {
    let rid_opt = state.socket_connected_room(&s).await;
    if rid_opt.is_none() {
        ack.send(&SocketIoAck::<MpvState>::err()).ok();
        return;
    }
    let rid = rid_opt.unwrap();
    let uid = state.socket2uid(&s).await;
    if state.user_file_loaded(uid).await {
        let uid2timestamp_rl = state.uid2timestamp.read().await;
        let rid2play_info_rl = state.rid2play_info.read().await;
        let uid_ping_rl = state.uid_ping.read().await;
        let rid2runtime_state_rl = state.rid2runtime_state.read().await;

        let room_runtime_state = rid2runtime_state_rl.get(&rid).unwrap();
        let play_info = rid2play_info_rl.get(&rid).unwrap();

        let mut relevant_uids = Vec::<Id>::new();
        let rid_uids_rl = state.rid_uids.read().await;
        let uids = rid_uids_rl.get_by_left(&rid).unwrap();
        for uid in uids {
            if let Some(timestamp_info) = uid2timestamp_rl.get(uid) {
                if Instant::now().duration_since(timestamp_info.recv).as_millis() < 2000 {
                    relevant_uids.push(*uid);
                }
            }
        }
        let mut timestamps = relevant_uids
            .iter()
            .map(|uid| state.get_compensated_timestamp_of_uid(
                *uid,
                rid,
                &uid2timestamp_rl,
                &rid2play_info_rl,
                &uid_ping_rl,
                &rid2runtime_state_rl
        ))
            .filter_map(|x| x)
            .collect::<Vec<f64>>();

        timestamps.sort_by(|a, b| a.partial_cmp(b).unwrap());
        let mut timestamp = *timestamps.first().unwrap_or(&0f64);
        if play_info.playing_state == PlayingState::Play {
            timestamp += room_runtime_state.runtime_config.desync_tolerance.to_f64().unwrap()
        }

        let play_info = rid2play_info_rl.get(&rid).unwrap();
        ack.send(&SocketIoAck::<MpvState>::ok(Some(MpvState{
            timestamp,
            playing_state: play_info.playing_state,
            playback_speed: room_runtime_state.playback_speed
        }))).ok();
        return;
    }
    ack.send(&SocketIoAck::<MpvState>::err()).ok();
}