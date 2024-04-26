use std::sync::Arc;
use crate::appstate::AppState;
use crate::config::{appdata, jwt};
use crate::config::{Language};
use crate::result::Result;

#[tauri::command]
pub async fn get_first_run_seen(state: tauri::State<'_, AppState>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.first_run_seen)
}

#[tauri::command]
pub async fn set_first_run_seen(state: tauri::State<'_, AppState>) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.first_run_seen = true;
    }
    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_language(state: tauri::State<'_, AppState>) -> Result<Language> {
    let appdata = state.appdata.read().await;
    Ok(appdata.lang)
}

#[tauri::command]
pub async fn set_language(state: tauri::State<'_, AppState>, language: Language) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.lang = language;
    }
    let appdata = state.appdata.read().await;
    rust_i18n::set_locale(appdata.lang.as_str());
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_target_family() -> Result<String> {
    Ok(std::env::consts::FAMILY.to_string())
}

#[tauri::command]
pub async fn jwt() -> Result<String> {
    Ok(jwt::read()?.unwrap_or("".to_string()))
}

#[tauri::command]
pub async fn clear_jwt() -> Result<()> {
    jwt::clear()
}
