use std::collections::HashMap;
use socketioxide::extract::SocketRef;
use socketioxide::SocketIo;
use sqlx::{PgPool};
use tokio::sync::RwLock;
use crate::bimultimap::BiMultiMap;
use crate::config::Config;
use crate::models::playlist::{PlaylistEntry, RoomPlayInfo, RoomRuntimeState, UserPlayInfo, UserReadyStatus};
use crate::models::query::Id;

pub type PlaylistEntryId = u64;

pub struct SrvState {
    pub config: Config,
    pub db: PgPool,
    pub socket_uid: RwLock<bimap::BiMap<socketioxide::socket::Sid, Id>>,
    pub socket_uid_disconnect: RwLock<HashMap<socketioxide::socket::Sid, Id>>,
    pub sid_hwid_hash: RwLock<HashMap<socketioxide::socket::Sid, String>>,
    pub io: RwLock<Option<SocketIo>>,
    pub rid_uids: RwLock<BiMultiMap<Id, Id>>,
    pub uid_ping: RwLock<HashMap<Id, f64>>,

    pub playlist_entry_next_id: RwLock<PlaylistEntryId>,

    pub playlist: RwLock<HashMap<PlaylistEntryId, PlaylistEntry>>,
    pub video_id2subtitles_ids: RwLock<BiMultiMap<PlaylistEntryId, PlaylistEntryId>>,

    pub rid_video_id: RwLock<BiMultiMap<Id, PlaylistEntryId>>,
    pub rid2runtime_state: RwLock<HashMap<Id, RoomRuntimeState>>,
    pub rid2play_info: RwLock<HashMap<Id, RoomPlayInfo>>,

    pub uid2ready_status: RwLock<HashMap<Id, UserReadyStatus>>,
    pub uid2play_info: RwLock<HashMap<Id, UserPlayInfo>>
}

impl SrvState {
    pub async fn socket2uid(&self, s: &SocketRef) -> Id {
        let socket_uid_lock = self.socket_uid.read().await;
        *socket_uid_lock.get_by_left(&s.id).unwrap()
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
        let mut video_id2subtitles_ids_wl = self.video_id2subtitles_ids.write().await;
        let mut playlist_wl = self.playlist.write().await;
        let mut rid_video_id_wl = self.rid_video_id.write().await;

        let subtitles_ids_opt = video_id2subtitles_ids_wl.get_by_left(&entry_id);
        if let Some(subtitles_ids) = subtitles_ids_opt {
            for subtitles_id in subtitles_ids {
                playlist_wl.remove(subtitles_id);
            }
        }
        video_id2subtitles_ids_wl.remove_by_left(&entry_id);
        rid_video_id_wl.remove_by_right(&entry_id);
        playlist_wl.remove(&entry_id);
    }

    pub async fn remove_subtitles_entry(&self, entry_id: PlaylistEntryId) {
        let mut video_id2subtitles_ids_wl = self.video_id2subtitles_ids.write().await;
        let mut playlist_wl = self.playlist.write().await;
        video_id2subtitles_ids_wl.remove_by_right(&entry_id);
        playlist_wl.remove(&entry_id);
    }
}