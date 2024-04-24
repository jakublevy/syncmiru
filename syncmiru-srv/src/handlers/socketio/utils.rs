use std::collections::HashMap;
use std::sync::RwLock;
use crate::models::query::Id;

pub(super) fn online_uids(socket_id2_uid: &RwLock<HashMap<socketioxide::socket::Sid, Id>>) -> Vec<Id> {
    socket_id2_uid
        .read()
        .expect("socket_id2_uid read lock error")
        .values()
        .cloned()
        .collect::<Vec<Id>>()
}