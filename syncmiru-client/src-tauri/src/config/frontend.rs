use std::env;
use std::sync::Arc;
use crate::appstate::AppState;
use crate::config::{appdata, jwt};
use crate::config::{Language};
use crate::result::Result;
use crate::sys;

#[tauri::command]
pub async fn get_first_run_seen(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.first_run_seen)
}

#[tauri::command]
pub async fn set_first_run_seen(state: tauri::State<'_, Arc<AppState>>) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.first_run_seen = true;
    }
    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_users_shown(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.users_shown)
}

#[tauri::command]
pub async fn set_users_shown(state: tauri::State<'_, Arc<AppState>>, users_shown: bool) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.users_shown = users_shown;
    }
    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_audio_sync(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.audio_sync)
}

#[tauri::command]
pub async fn set_audio_sync(state: tauri::State<'_, Arc<AppState>>, audio_sync: bool) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.audio_sync = audio_sync;
    }
    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_sub_sync(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.sub_sync)
}

#[tauri::command]
pub async fn set_sub_sync(state: tauri::State<'_, Arc<AppState>>, sub_sync: bool) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.sub_sync = sub_sync;
    }
    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_language(state: tauri::State<'_, Arc<AppState>>) -> Result<Language> {
    let appdata = state.appdata.read().await;
    Ok(appdata.lang)
}

#[tauri::command]
pub async fn set_language(state: tauri::State<'_, Arc<AppState>>, language: Language) -> Result<()> {
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
pub async fn get_jwt() -> Result<String> {
    Ok(jwt::read()?.unwrap_or("".to_string()))
}

#[tauri::command]
pub async fn clear_jwt() -> Result<()> {
    jwt::clear()
}

#[tauri::command]
pub async fn get_hwid_hash() -> Result<String> { sys::id_hashed() }

#[tauri::command]
pub async fn get_mpv_win_detached(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.mpv_win_detached)
}

#[tauri::command]
pub async fn set_mpv_win_detached(state: tauri::State<'_, Arc<AppState>>, mpv_win_detached: bool) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.mpv_win_detached = mpv_win_detached;
    }
    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}