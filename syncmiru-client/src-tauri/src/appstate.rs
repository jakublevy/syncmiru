use std::collections::HashMap;
use tokio::sync::{RwLock};
use tokio::sync::mpsc;
use tokio::time::Instant;
use crate::config::appdata::AppData;
use crate::mpv;
use crate::result::Result;

#[cfg(target_family = "unix")]
use x11rb::rust_connection::RustConnection;

#[derive(Debug)]
pub struct AppState {
    pub appdata: RwLock<AppData>,
    pub mpv_wid: RwLock<Option<usize>>,
    pub mpv_stop_tx: RwLock<Option<tokio::sync::oneshot::Sender<()>>>,
    pub mpv_ipc_tx: RwLock<Option<mpsc::Sender<mpv::ipc::Interface>>>,
    pub mpv_reattach_on_fullscreen_false: RwLock<bool>,
    pub mpv_next_req_id: RwLock<u32>,
    pub mpv_response_senders: RwLock<HashMap<u32, mpsc::Sender<serde_json::Value>>>,
    pub mpv_ignore_fullscreen_events_timestamp: RwLock<Instant>,
    pub mpv_ignore_next_pause_true_event: RwLock<bool>,
    pub mpv_ignore_next_pause_false_event: RwLock<bool>,
    pub mpv_ignore_next_seek_event: RwLock<bool>,
    pub mpv_not_ready_msg_id: RwLock<Option<u32>>,
    pub mpv_loading_msg_id: RwLock<Option<u32>>,
    pub mpv_everyone_ready_msg_id: RwLock<Option<u32>>,
    pub mpv_neutral_msgs: RwLock<Vec<MpvMsg>>,
    pub mpv_ignore_next_speed_event: RwLock<bool>,
    pub mpv_ignore_next_audio_change_event: RwLock<bool>,
    pub mpv_ignore_next_sub_change_event: RwLock<bool>,
    pub mpv_ignore_next_audio_delay_event: RwLock<bool>,
    pub mpv_ignore_next_sub_delay_event: RwLock<bool>,

    #[cfg(target_family = "unix")]
    pub x11_conn: RwLock<Option<RustConnection>>,

    #[cfg(target_family = "unix")]
    pub x11_screen_num: RwLock<Option<usize>>
}

impl AppState {
    pub async fn read_home_srv(&self) -> Result<String> {
        let appdata_lock = self.appdata.read().await;
        let home_srv = appdata_lock.home_srv.clone().unwrap_or("".to_string());
        Ok(home_srv)
    }

    pub async fn get_mpv_next_req_id(&self) -> u32 {
        let mut mpv_next_req_id_wl = self.mpv_next_req_id.write().await;
        let req_id = *mpv_next_req_id_wl;
        *mpv_next_req_id_wl = *mpv_next_req_id_wl + 1;
        req_id
    }
}

#[derive(Debug, Copy, Clone)]
pub struct MpvMsg {
    pub id: u32,
    pub timestamp: Instant,
    pub duration: f64
}

impl MpvMsg {
    pub fn is_shown(&self) -> bool {
        Instant::now().duration_since(self.timestamp).as_secs_f64() < self.duration
    }
}