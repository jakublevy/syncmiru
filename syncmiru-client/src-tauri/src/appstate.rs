use std::sync::RwLock;
use crate::config::appdata::AppData;

pub struct AppState {
    pub appdata: RwLock<AppData>,
    pub socket: RwLock<Option<rust_socketio::asynchronous::Client>>,
    pub window: RwLock<Option<tauri::Window>>
}