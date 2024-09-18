use std::sync::Arc;
use std::time::Duration;
use rust_decimal::prelude::ToPrimitive;
use tokio::sync::mpsc::Receiver;
use tokio::task::JoinHandle;
use tokio::time::{sleep, Instant};
use crate::constants;
use crate::models::query::Id;
use crate::models::socketio::SocketIoAck;
use crate::srvstate::{SrvState, TimestampInfo};

pub enum DesyncTimerInterface {
    Wake,
    Sleep
}

pub async fn desync_timer_controller(state: Arc<SrvState>, mut rx: Receiver<DesyncTimerInterface>) {
    let mut task_handle: Option<JoinHandle<()>> = None;
    loop {
        let msg_opt = rx.recv().await;
        if let Some(msg) = msg_opt {
            match msg {
                DesyncTimerInterface::Wake => {
                    if task_handle.is_none() {
                        task_handle = Some(tokio::spawn(desync_timer(state.clone())))
                    }
                }
                DesyncTimerInterface::Sleep => {
                    if let Some(handle) = task_handle.as_ref() {
                        handle.abort();
                        task_handle = None;
                    }
                }
            }
        }
    }
}

async fn desync_timer(state: Arc<SrvState>) {
    loop {
        {
            let rid_uids_rl = state.rid_uids.read().await;
            let rid_uids_hashmap = rid_uids_rl.get_key_to_values_hashmap();

            let rid2play_info_rl = state.rid2play_info.read().await;
            let uid_ping_rl = state.uid_ping.read().await;
            let mut uid2timestamp_wl = state.uid2timestamp.write().await;
            let rid2runtime_state_rl = state.rid2runtime_state.read().await;

            for (rid, uids) in rid_uids_hashmap {
                let room_runtime_state_opt = rid2runtime_state_rl.get(&rid);
                if room_runtime_state_opt.is_none() {
                    continue;
                }
                let room_runtime_state = room_runtime_state_opt.unwrap();

                let play_info_opt = rid2play_info_rl.get(&rid);
                if play_info_opt.is_none() {
                    continue;
                }

                let mut relevant_uids = Vec::<Id>::new();
                for uid in uids {
                    if let Some(timestamp_info) = uid2timestamp_wl.get(uid) {
                        if Instant::now().duration_since(timestamp_info.recv).as_millis() < constants::TIMESTAMP_TICK_MAX_OLD_MS {
                            relevant_uids.push(*uid);
                        }
                    }
                }
                let mut timestamps = relevant_uids
                    .iter()
                    .map(|uid| state.get_compensated_timestamp_of_uid(
                        *uid,
                        *rid,
                        &uid2timestamp_wl,
                        &rid2play_info_rl,
                        &uid_ping_rl,
                        &rid2runtime_state_rl
                    ))
                    .filter_map(|x| x)
                    .collect::<Vec<f64>>();

                timestamps.sort_by(|a, b| a.partial_cmp(b).unwrap());
                if !timestamps.is_empty() {
                    let smallest_timestamp = timestamps.first().unwrap();

                    // major desync
                    for uid in uids {
                        let timestamp_info_opt = uid2timestamp_wl.get_mut(uid);
                        if let Some(timestamp_info) = timestamp_info_opt {
                            if timestamp_info.timestamp - smallest_timestamp > room_runtime_state.runtime_config.major_desync_min.to_f64().unwrap() {
                                let io_rl = state.io.read().await;
                                let io = io_rl.as_ref().unwrap();
                                if let Some(sid) = state.uid2sid(*uid).await {
                                    if let Some(s) = io.get_socket(sid) {
                                        s.emit("major_desync_seek", smallest_timestamp).ok();
                                        timestamp_info.timestamp = *smallest_timestamp;
                                    }
                                }

                            }
                        }
                    }
                    // minor desync

                }
            }
        }
        sleep(Duration::from_millis(1000)).await;
    }
}