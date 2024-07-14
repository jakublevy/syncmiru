use tokio::sync::{RwLock};
use crate::config::appdata::AppData;
use crate::result::Result;

#[derive(Debug)]
pub struct AppState {
    pub appdata: RwLock<AppData>,
    pub mpv_id: RwLock<Option<u32>>,
    pub mpv_tx: RwLock<Option<tokio::sync::oneshot::Sender<()>>>
}

impl AppState {
    pub async fn read_home_srv(&self) -> Result<String> {
        let appdata_lock = self.appdata.read().await;
        let home_srv = appdata_lock.home_srv.clone().unwrap_or("".to_string());
        Ok(home_srv)
    }

    pub async fn mpv_is_running(&self) -> bool {
        let mpv_tx_rl = self.mpv_tx.read().await;
        mpv_tx_rl.is_some()
    }
}