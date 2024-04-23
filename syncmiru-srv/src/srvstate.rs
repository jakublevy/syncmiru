use std::collections::HashMap;
use std::sync::RwLock;
use socketioxide::extract::SocketRef;
use sqlx::{PgPool};
use crate::config::Config;

#[derive(Debug)]
pub struct SrvState {
    pub config: Config,
    pub db: PgPool,
    pub socket_id2_uid: RwLock<HashMap<socketioxide::socket::Sid, i32>>
}

impl SrvState {
    pub fn socket2uid(&self, s: &SocketRef) -> i32 {
        let socket_id2_uid_lock = self.socket_id2_uid.read()
            .expect("locking socket_id2_uid failed");
        socket_id2_uid_lock[&s.id]
    }
}