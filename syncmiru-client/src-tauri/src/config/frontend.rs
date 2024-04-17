use std::thread::available_parallelism;
use crate::appstate::AppState;
use crate::config::appdata;
use crate::config::{Language};
use crate::deps::{DepsAvailable};
use crate::result::Result;

#[tauri::command]
pub async fn get_first_run_seen(state: tauri::State<'_, AppState>) -> Result<bool> {
    let appdata = state.appdata.read()?;
    Ok(appdata.first_run_seen)
}

#[tauri::command]
pub async fn set_first_run_seen(state: tauri::State<'_, AppState>) -> Result<()> {
    let mut appdata = state.appdata.write()?;
    appdata.first_run_seen = true;
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_language(state: tauri::State<'_, AppState>) -> Result<Language> {
    let appdata = state.appdata.read()?;
    Ok(appdata.lang)
}

#[tauri::command]
pub async fn set_language(state: tauri::State<'_, AppState>, language: Language) -> Result<()> {
    let mut appdata = state.appdata.write()?;
    appdata.lang = language;
    rust_i18n::set_locale(appdata.lang.as_str());
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_target_family() -> Result<String> {
    Ok(std::env::consts::FAMILY.to_lowercase().to_string())
}