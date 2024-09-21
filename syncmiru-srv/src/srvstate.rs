use std::collections::{HashMap, HashSet};
use std::ops::Deref;
use rust_decimal::Decimal;
use rust_decimal::prelude::ToPrimitive;
use serde::{Deserialize, Serialize};
use serde_repr::Serialize_repr;
use socketioxide::extract::SocketRef;
use socketioxide::socket::Sid;
use socketioxide::SocketIo;
use sqlx::{PgPool};
use tokio::sync::{RwLock};
use tokio::sync::mpsc::Sender;
use tokio::time::Instant;
use crate::bimultimap::BiMultiMap;
use crate::config::Config;
use crate::handlers;
use crate::handlers::timers::DesyncTimerInterface;
use crate::models::query::{Id, RoomSettings};

pub type PlaylistEntryId = u64;

pub struct SrvState {
    pub config: Config,
    pub db: PgPool,
    pub desync_timer_tx: Sender<handlers::timers::DesyncTimerInterface>,
    pub socket_uid: RwLock<bimap::BiMap<socketioxide::socket::Sid, Id>>,
    pub socket_uid_disconnect: RwLock<HashMap<socketioxide::socket::Sid, Id>>,
    pub sid_hwid_hash: RwLock<HashMap<socketioxide::socket::Sid, String>>,
    pub io: RwLock<Option<SocketIo>>,
    pub rid_uids: RwLock<BiMultiMap<Id, Id>>,
    pub uid_ping: RwLock<HashMap<Id, f64>>,

    pub playlist_entry_next_id: RwLock<PlaylistEntryId>,
    pub playlist: RwLock<HashMap<PlaylistEntryId, PlaylistEntry>>,

    pub rid_video_id: RwLock<BiMultiMap<Id, PlaylistEntryId>>,
    pub rid2runtime_state: RwLock<HashMap<Id, RoomRuntimeState>>,
    pub rid2play_info: RwLock<HashMap<Id, RoomPlayInfo>>,

    pub uid2ready_status: RwLock<HashMap<Id, UserReadyStatus>>,
    pub uid2play_info: RwLock<HashMap<Id, UserPlayInfo>>,

    pub uid2timestamp: RwLock<HashMap<Id, TimestampInfo>>,
    pub uid2minor_desync: RwLock<HashSet<Id>>
}

impl SrvState {
    pub async fn socket2uid(&self, s: &SocketRef) -> Id {
        let socket_uid_lock = self.socket_uid.read().await;
        *socket_uid_lock.get_by_left(&s.id).unwrap()
    }

    pub async fn uid2sid(&self, uid: Id) -> Option<Sid> {
        let socket_uid_lock = self.socket_uid.read().await;
        socket_uid_lock.get_by_right(&uid).map(|x|x.clone())
    }

    pub async fn socket2hwid_hash(&self, s: &SocketRef) -> String {
        let sid_hwid_hash_rl = self.sid_hwid_hash.read().await;
        sid_hwid_hash_rl.get(&s.id).map(|x| x.clone()).unwrap()
    }

    pub async fn socket_connected_room(&self, s: &SocketRef) -> Option<Id> {
        let rooms = s.rooms().expect("socketio error");
        if rooms.is_empty() {
            None
        }
        else {
            let joined_room = rooms.get(0).unwrap();
            joined_room.parse::<Id>().ok()
        }
    }

    pub async fn next_playlist_entry_id(&self) -> PlaylistEntryId {
        let mut wl = self.playlist_entry_next_id.write().await;
        let ret_id = wl.clone();
        *wl = ret_id + 1;
        ret_id
    }

    pub async fn clear_uid2play_info_by_rid(&self, rid: Id) {
        let mut uid2play_info_wl = self.uid2play_info.write().await;
        let rid_uids_rl = self.rid_uids.read().await;
        let uids = rid_uids_rl.get_by_left(&rid).unwrap();
        for uid in uids {
            uid2play_info_wl.remove(uid);
        }
    }

    pub async fn remove_video_entry(&self, entry_id: PlaylistEntryId) {
        let mut playlist_wl = self.playlist.write().await;
        let mut rid_video_id_wl = self.rid_video_id.write().await;

        rid_video_id_wl.remove_by_right(&entry_id);
        playlist_wl.remove(&entry_id);

        if playlist_wl.is_empty() {
            self.desync_timer_tx.send(DesyncTimerInterface::Sleep).await.ok();
        }
    }

    pub async fn user_file_loaded(&self, uid: Id) -> bool {
        let uid2ready_status_wl = self.uid2ready_status.write().await;
        if let Some(ready_status) = uid2ready_status_wl.get(&uid) {
            *ready_status == UserReadyStatus::Ready || *ready_status == UserReadyStatus::NotReady
        }
        else {
            false
        }
    }

    pub fn get_compensated_timestamp_of_uid<'a, A, B, C, D>(
        &self,
        uid: Id,
        rid: Id,
        uid2timestamp_rl: &A,
        rid2play_info_rl: &B,
        uid_ping_rl: &C,
        rid2runtime_state_rl: &D
    ) -> Option<f64>
    where
        A: Deref<Target = HashMap<Id, TimestampInfo>>,
        B: Deref<Target = HashMap<Id, RoomPlayInfo>>,
        C: Deref<Target = HashMap<Id, f64>>,
        D: Deref<Target = HashMap<Id, RoomRuntimeState>>
    {
        let timestamp_info_opt = uid2timestamp_rl.get(&uid);
        if timestamp_info_opt.is_none() {
            return None
        }
        let play_info_opt = rid2play_info_rl.get(&rid);
        if play_info_opt.is_none() {
            return None
        }
        let play_info = play_info_opt.unwrap();
        let timestamp_info = timestamp_info_opt.unwrap();
        let mut compensated_timestamp = timestamp_info.timestamp;
        if play_info.playing_state == PlayingState::Play {
            let mut compensation_start = play_info.last_change_at;
            if play_info.last_change_at < timestamp_info.recv {
                compensation_start = timestamp_info.recv;
            }
            let duration = Instant::now().duration_since(compensation_start);
            let room_runtime_state = rid2runtime_state_rl.get(&rid).unwrap();
            let ping_ms = *uid_ping_rl.get(&uid).unwrap_or(&0f64);

            compensated_timestamp +=
                duration.as_secs_f64() * room_runtime_state.playback_speed.to_f64().unwrap()
                + (ping_ms / 1000f64);

            Some(compensated_timestamp)
        }
        else {
            Some(compensated_timestamp)
        }
    }

    pub async fn clear_minor_desync_uids_for_rid(&self, rid: Id) {
        let mut uid2minor_desync_wl = self.uid2minor_desync.write().await;
        let rid_uids_rl = self.rid_uids.read().await;
        if let Some(uids) = rid_uids_rl.get_by_left(&rid) {
            for uid in uids {
                uid2minor_desync_wl.remove(uid);
            }
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum PlaylistEntry {
    Video { source: String, path: String },
    Url { url: String }
}


#[derive(Debug)]
pub struct RoomPlayInfo {
    pub playing_entry_id: PlaylistEntryId,
    pub playing_state: PlayingState,
    pub last_change_at: Instant
}

#[derive(Debug)]
pub struct RoomRuntimeState {
    pub playback_speed: Decimal,
    pub runtime_config: RoomSettings,
}

#[derive(Debug, Copy, Clone, PartialEq, Serialize_repr)]
#[repr(u8)]
pub enum PlayingState {
    Play = 0,
    Pause = 1
}

#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserPlayInfo {
    pub aid: Option<u64>,
    pub sid: Option<u64>,
    pub audio_sync: bool,
    pub sub_sync: bool,
    pub audio_delay: f64,
    pub sub_delay: f64,
}

#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
pub enum UserReadyStatus {
    Ready, NotReady, Loading, Error
}

#[derive(Debug, Copy, Clone)]
pub struct TimestampInfo {
    pub timestamp: f64,
    pub recv: Instant
}