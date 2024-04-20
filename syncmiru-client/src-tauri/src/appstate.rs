use std::sync::{Arc, RwLock};
use crate::config::appdata::AppData;

pub struct AppState {
    pub appdata: RwLock<AppData>,
    pub socket: RwLock<Option<rust_socketio::asynchronous::Client>>,
    pub window: RwLock<Option<tauri::Window>>
}

pub mod extract {
    use std::sync::RwLock;
    use anyhow::Context;
    use crate::result::Result;
    pub fn window(window: &RwLock<Option<tauri::Window>>) -> Result<tauri::Window> {
        let mut w: tauri::Window;
        {
            w = window
            .read()?
            .clone()
            .context("Missing tauri::window")?;
        }
        Ok(w)
    }
}