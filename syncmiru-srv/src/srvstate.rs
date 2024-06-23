use std::collections::HashMap;
use socketioxide::extract::SocketRef;
use socketioxide::SocketIo;
use sqlx::{PgPool};
use tokio::sync::RwLock;
use crate::bimultimap::BiMultiMap;
use crate::config::Config;
use crate::models::playlist::PlaylistFile;
use crate::models::query::Id;

pub type PlaylistId = u64;

pub struct SrvState {
    pub config: Config,
    pub db: PgPool,
    pub socket_uid: RwLock<bimap::BiMap<socketioxide::socket::Sid, Id>>,
    pub socket_uid_disconnect: RwLock<HashMap<socketioxide::socket::Sid, Id>>,
    pub sid_hwid_hash: RwLock<HashMap<socketioxide::socket::Sid, String>>,
    pub io: RwLock<Option<SocketIo>>,
    pub rid_uids: RwLock<BiMultiMap<Id, Id>>,
    pub uid_ping: RwLock<HashMap<Id, f64>>,

    pub playlist_entry_next_id: RwLock<PlaylistId>,
    pub rid2playlist_id: RwLock<multimap::MultiMap<Id, PlaylistId>>,
    pub playlist: RwLock<HashMap<PlaylistId, PlaylistFile>>
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

    pub async fn next_playlist_entry_id(&self) -> PlaylistId {
        let mut wl = self.playlist_entry_next_id.write().await;
        let ret_id = wl.clone();
        *wl = ret_id + 1;
        ret_id
    }
}