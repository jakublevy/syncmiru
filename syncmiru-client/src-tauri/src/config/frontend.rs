use std::sync::Arc;
use crate::appstate::AppState;
use crate::config::{appdata, jwt};
use crate::config::{Language};
use crate::result::Result;

#[tauri::command]
pub async fn get_first_run_seen(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read()?;
    Ok(appdata.first_run_seen)
}

#[tauri::command]
pub async fn set_first_run_seen(state: tauri::State<'_, Arc<AppState>>) -> Result<()> {
    let mut appdata = state.appdata.write()?;
    appdata.first_run_seen = true;
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_language(state: tauri::State<'_, Arc<AppState>>) -> Result<Language> {
    let appdata = state.appdata.read()?;
    Ok(appdata.lang)
}

#[tauri::command]
pub async fn set_language(state: tauri::State<'_, Arc<AppState>>, language: Language) -> Result<()> {
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

#[tauri::command]
pub async fn jwt() -> Result<String> {
    Ok(jwt::read()?.unwrap_or("".to_string()))
}

#[tauri::command]
pub async fn clear_jwt() -> Result<()> {
    jwt::clear()
}
