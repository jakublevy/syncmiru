use std::collections::HashMap;
use anyhow::Context;
use tokio::sync::{RwLock};
use tokio::sync::mpsc::Sender;
use crate::config::appdata::AppData;
use crate::mpv;
use crate::result::Result;

#[cfg(target_family = "unix")]
use x11rb::rust_connection::RustConnection;
use crate::mpv::ipc::Interface;

#[derive(Debug)]
pub struct AppState {
    pub appdata: RwLock<AppData>,
    pub mpv_wid: RwLock<Option<usize>>,
    pub mpv_stop_tx: RwLock<Option<tokio::sync::oneshot::Sender<()>>>,
    pub mpv_ipc_tx: RwLock<Option<Sender<mpv::ipc::Interface>>>,
    pub mpv_reattach_on_fullscreen_false: RwLock<bool>,
    pub mpv_next_req_id: RwLock<u32>,
    pub mpv_response_senders: RwLock<HashMap<u32, Sender<serde_json::Value>>>,
    pub mpv_ignore_next_fullscreen_event: RwLock<bool>,

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

    pub async fn set_mpv_fullscreen(&self, state: bool) -> Result<()> {
        let mpv_ipc_tx_rl = self.mpv_ipc_tx.read().await;
        let iface = mpv_ipc_tx_rl.as_ref().context("mpv_ipc_tx is None")?;
        iface.send(Interface::SetFullscreen(state)).await?;
        Ok(())
    }

    pub async fn next_req_id(&self) -> u32 {
        let mut mpv_next_req_id_wl = self.mpv_next_req_id.write().await;
        let req_id = *mpv_next_req_id_wl;
        *mpv_next_req_id_wl = *mpv_next_req_id_wl + 1;
        req_id
    }
}