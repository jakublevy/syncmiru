use std::sync::{Arc, RwLock};
use crate::config::appdata::AppData;

pub struct AppState {
    pub appdata: RwLock<AppData>,
    pub socket: RwLock<Option<rust_socketio::asynchronous::Client>>,
    pub window: RwLock<Option<tauri::Window>>,
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

    pub fn socket(socket: &RwLock<Option<rust_socketio::asynchronous::Client>>) -> Result<Option<rust_socketio::asynchronous::Client>> {
        let mut ret: Option<rust_socketio::asynchronous::Client> = None;
        let mut socket_lock = socket.read()?;
        if let Some(socket) = socket_lock.clone() {
            ret = Some(socket)
        }
        Ok(ret)
    }
}