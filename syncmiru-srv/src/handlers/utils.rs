use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use rand::Rng;
use socketioxide::extract::SocketRef;
use tokio::sync::RwLock;
use crate::config::Rate;
use crate::models::query::{EmailTknType, Id};
use crate::models::socketio::{EmailChangeTkn, EmailChangeTknType};
use crate::{crypto, query};
use crate::models::playlist::UserReadyStatus;
use crate::srvstate::{PlaylistEntryId, SrvState};
use crate::result::Result;

pub(super) async fn check_email_tkn_out_of_quota(
    state: &SrvState,
    uid: Id,
    email_type: EmailTknType,
) -> Result<bool> {
    let mut out_of_quota = false;
    if state.config.email.rates.is_some() {
        let email_rates = state.config.email.rates.unwrap();
        let rates_opt: Option<Rate> = match email_type {
            EmailTknType::ForgottenPassword => email_rates.forgotten_password,
            EmailTknType::Verify => email_rates.verification,
            EmailTknType::DeleteAccount => email_rates.delete_account
        };
        if rates_opt.is_some() {
            let rates = rates_opt.unwrap();
            out_of_quota = query::out_of_email_tkn_quota(
                &state.db,
                uid,
                &email_type,
                rates.max,
                rates.per,
            ).await?;
        }

        if out_of_quota {
            return Ok(false);
        }

        let waited = query::waited_before_last_email_tkn(
            &state.db,
            uid,
            &email_type,
            state.config.email.wait_before_resend,
        ).await?;

        if !waited {
            return Ok(false);
        }
        Ok(true)
    }
    else {
        Ok(true)
    }
}

pub(super) async fn random_sleep(from_millis: u64, to_millis: u64) {
    let sleep_duration = rand::thread_rng().gen_range(
        Duration::from_millis(from_millis)..=Duration::from_millis(to_millis)
    );
    tokio::time::sleep(sleep_duration).await;
}

pub(super) async fn is_change_email_out_of_quota(
    state: &SrvState,
    uid: Id,
) -> Result<bool> {
    let mut out_of_quota = false;
    if state.config.email.rates.is_some() {
        let rates = state.config.email.rates.unwrap();
        if rates.change_email.is_some() {
            let ce_rate = rates.change_email.unwrap();
            out_of_quota = query::out_of_change_email_quota(
                &state.db,
                uid,
                ce_rate.max,
                ce_rate.per
            ).await?;

            if out_of_quota {
                return Ok(out_of_quota)
            }

            let waited = query::waited_before_last_change_email(
                &state.db,
                uid,
                state.config.email.wait_before_resend
            ).await?;
            if !waited {
                return Ok(!waited)
            }
        }
    }
    Ok(out_of_quota)
}

pub(super) async fn check_email_change_tkn(
    state: &SrvState,
    payload: &EmailChangeTkn,
    uid: Id
) -> Result<bool> {

    let mut tkn_hash_opt: Option<String> = None;
    if payload.tkn_type == EmailChangeTknType::From {
        tkn_hash_opt = query::get_valid_hashed_email_from_tkn(
            &state.db,
            uid,
            state.config.email.token_valid_time
        )
            .await
            .expect("db error")
    }
    else {
        tkn_hash_opt = query::get_valid_hashed_email_to_tkn(
            &state.db,
            uid,
            state.config.email.token_valid_time
        )
            .await
            .expect("db error")
    }
    if tkn_hash_opt.is_none() {
        return Ok(false)
    }

    let tkn_hash_db = tkn_hash_opt.unwrap();
    if crypto::verify(payload.tkn.clone(), tkn_hash_db).await.expect("argon2 error") {
        Ok(true)
    }
    else {
        Ok(false)
    }
}

pub(super) async fn disconnect_from_room(
    state: &Arc<SrvState>,
    s: &SocketRef,
    uid: Id,
    rid: Id,
) {
    let mut rid_uids_lock = state.rid_uids.write().await;
    let mut uid2_play_info_lock = state.uid2play_info.write().await;
    let mut uid2ready_status_lock = state.uid2ready_status.write().await;
    s.leave_all().ok();
    rid_uids_lock.remove_by_right(&uid);
    uid2_play_info_lock.remove(&uid);
    uid2ready_status_lock.remove(&uid);

    if rid_uids_lock.get_by_left(&rid).is_none() {
        // last user disconnect
        let mut playlist_wl = state.playlist.write().await;
        let mut rid_video_id_wl = state.rid_video_id.write().await;
        let mut video_id2subtitles_ids_wl  = state.video_id2subtitles_ids.write().await;
        let mut rid2play_info_wl = state.rid2play_info.write().await;
        let mut rid2runtime_state_wl = state.rid2runtime_state.write().await;

        let video_ids_opt = rid_video_id_wl.get_by_left(&rid);
        if let Some(video_ids) = video_ids_opt {
            for video_id in video_ids {

                // remove subtitles from playlist
                let subtitles_ids_opt = video_id2subtitles_ids_wl.get_by_left(video_id);
                if let Some(subtitles_ids) = subtitles_ids_opt {
                    for subtitles_id in subtitles_ids {
                        playlist_wl.remove(subtitles_id);
                    }
                }
                // remove subtitles from video association
                video_id2subtitles_ids_wl.remove_by_left(video_id);

                // remove video from playlist
                playlist_wl.remove(video_id);
            }
        }
        rid_video_id_wl.remove_by_left(&rid);
        rid2play_info_wl.remove(&rid);
        rid2runtime_state_wl.remove(&rid);
    }
}

pub(super) async fn entry_id_in_playlist(
    state: &Arc<SrvState>,
    playlist_entry_id: PlaylistEntryId
) -> bool {
    let playlist_rl = state.playlist.read().await;
    playlist_rl.contains_key(&playlist_entry_id)
}

pub(super) async fn video_id_in_room(
    state: &Arc<SrvState>,
    rid: Id,
    playlist_entry_id: PlaylistEntryId
) -> bool {
    let rid2video_id_rl = state.rid_video_id.read().await;
    let rid_of_entry_opt = rid2video_id_rl.get_by_right(&playlist_entry_id);
    rid_of_entry_opt.is_some() && *rid_of_entry_opt.unwrap() == rid
}

pub(super) async fn subtitles_id_in_room(
    state: &Arc<SrvState>,
    rid: Id,
    playlist_entry_id: PlaylistEntryId
) -> bool {
    let video_id2subtitles_ids_rl = state.video_id2subtitles_ids.read().await;
    let video_id_of_entry_opt = video_id2subtitles_ids_rl.get_by_right(&playlist_entry_id);
    if video_id_of_entry_opt.is_none() {
        return false
    }

    let video_id = video_id_of_entry_opt.unwrap();
    video_id_in_room(state, rid, *video_id).await
}


pub(super) fn debug_print(state: &Arc<SrvState>) {
    println!("playlist: {:?}", state.playlist);
    println!("---------------------------------------");
    println!("rid_video_id: {:?}", state.rid_video_id);
    println!("---------------------------------------");
    println!("video_id2subtitles_ids: {:?}", state.video_id2subtitles_ids);
    println!("---------------------------------------");
    println!("rid2runtime_state: {:?}", state.rid2runtime_state);
    println!("---------------------------------------");
    println!("rid2play_info: {:?}", state.rid2play_info);
    println!("---------------------------------------");
    println!("uid2ready_status: {:?}", state.uid2ready_status);
    println!("---------------------------------------");
    println!("uid2_play_info: {:?}", state.uid2play_info);
}