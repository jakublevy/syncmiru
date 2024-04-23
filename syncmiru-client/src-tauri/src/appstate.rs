use std::sync::{RwLock};
use crate::config::appdata::AppData;

pub struct AppState {
    pub appdata: RwLock<AppData>,
}
