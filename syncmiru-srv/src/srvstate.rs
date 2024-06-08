use std::collections::HashMap;
use socketioxide::extract::SocketRef;
use socketioxide::SocketIo;
use sqlx::{PgPool};
use tokio::sync::RwLock;
use crate::bimultimap::BiMultiMap;
use crate::config::Config;
use crate::models::query::Id;

pub struct SrvState {
    pub config: Config,
    pub db: PgPool,
    pub socket_uid: RwLock<bimap::BiMap<socketioxide::socket::Sid, Id>>,
    pub socket_uid_disconnect: RwLock<HashMap<socketioxide::socket::Sid, Id>>,
    pub sid_hwid_hash: RwLock<HashMap<socketioxide::socket::Sid, String>>,
    pub io: RwLock<Option<SocketIo>>,
    pub rid_uids: RwLock<BiMultiMap<Id, Id>>
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

    // pub async fn join_room(&self, rid: Id, s: &SocketRef) {
    //     let uid = self.socket2uid(s).await;
    //     s.leave_all().ok();
    //     s.join(rid.to_string()).ok();
    //     {
    //         let mut rid_uids_lock = self.rid_uids.write().await;
    //         rid_uids_lock.insert(rid, uid)
    //     }
    // }

    // pub async fn socket_connected_room(&self, s: &SocketRef) -> Option<Id> {
    //     let uid = self.socket2uid(s).await;
    //     let rid_uid_lock = self.rid_uids.read().await;
    //     rid_uid_lock.get_by_right(&uid).map(|&x|x.clone())
    // }
}