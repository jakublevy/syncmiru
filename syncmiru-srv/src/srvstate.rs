use socketioxide::extract::SocketRef;
use socketioxide::SocketIo;
use sqlx::{PgPool};
use tokio::sync::RwLock;
use crate::config::Config;
use crate::models::query::Id;

pub struct SrvState {
    pub config: Config,
    pub db: PgPool,
    pub socket_uid: RwLock<bimap::BiMap<socketioxide::socket::Sid, Id>>,
    pub io: RwLock<Option<SocketIo>>
}

impl SrvState {
    pub async fn socket2uid(&self, s: &SocketRef) -> Id {
        let socket_uid_lock = self.socket_uid.read().await;
        *socket_uid_lock.get_by_left(&s.id).unwrap()
    }
}