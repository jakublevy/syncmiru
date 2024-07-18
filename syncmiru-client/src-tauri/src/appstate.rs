use tokio::sync::{RwLock};
use tokio::sync::mpsc::Sender;
use crate::config::appdata::AppData;
use crate::mpv;
use crate::result::Result;

#[derive(Debug)]
pub struct AppState {
    pub appdata: RwLock<AppData>,
    pub mpv_wid: RwLock<Option<usize>>,
    pub mpv_stop_tx: RwLock<Option<tokio::sync::oneshot::Sender<()>>>,
    pub mpv_ipc_tx: RwLock<Option<Sender<mpv::ipc::Interface>>>
}

impl AppState {
    pub async fn read_home_srv(&self) -> Result<String> {
        let appdata_lock = self.appdata.read().await;
        let home_srv = appdata_lock.home_srv.clone().unwrap_or("".to_string());
        Ok(home_srv)
    }

    pub async fn read_mpv_wid(&self) -> usize {
        let mpv_wid_rl = self.mpv_wid.read().await;
        mpv_wid_rl.unwrap()
    }

    pub async fn mpv_is_running(&self) -> bool {
        let mpv_tx_rl = self.mpv_stop_tx.read().await;
        mpv_tx_rl.is_some()
    }
}