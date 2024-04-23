use std::sync::{RwLock};
use crate::config::appdata::AppData;
use crate::result::Result;

pub struct AppState {
    pub appdata: RwLock<AppData>,
}

impl AppState {
    pub fn read_home_srv(&self) -> Result<String> {
        let appdata_lock = self.appdata.read()?;
        let home_srv = appdata_lock.home_srv.clone().unwrap_or("".to_string());
        Ok(home_srv)
    }
}