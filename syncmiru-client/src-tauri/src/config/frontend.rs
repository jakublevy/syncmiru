use std::thread::{available_parallelism, sleep};
use std::time::Duration;
use winapi::um::synchapi::Sleep;
use crate::appstate::AppState;
use crate::config::appdata::write_config;
use crate::config::{Language, utils};
use crate::config::deps::{DepsInfo, DepsStateFrontend};
use crate::result::Result;

#[tauri::command]
pub async fn get_first_run_seen(state: tauri::State<'_, AppState>) -> Result<bool> {
    let appdata = state.appdata.read()?;
    //sleep(Duration::from_secs(1));
    Ok(appdata.first_run_seen)
}

#[tauri::command]
pub async fn set_first_run_seen(state: tauri::State<'_, AppState>) -> Result<()> {
    let mut appdata = state.appdata.write()?;
    appdata.first_run_seen = true;
    write_config(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_language(state: tauri::State<'_, AppState>) -> Result<Language> {
    let appdata = state.appdata.read()?;
    //sleep(Duration::from_secs(1));
    Ok(appdata.lang)
}

#[tauri::command]
pub async fn set_language(state: tauri::State<'_, AppState>, language: Language) -> Result<()> {
    let mut appdata = state.appdata.write()?;
    appdata.lang = language;
    rust_i18n::set_locale(appdata.lang.as_str());
    write_config(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_deps_state(state: tauri::State<'_, AppState>) -> Result<DepsStateFrontend> {
    //sleep(Duration::from_secs(3));
    let mut appdata = state.appdata.write()?;
    if cfg!(target_family = "windows") && !appdata.first_run_seen {
        let local = DepsInfo::from_params(true, &appdata.mpv_path, &appdata.yt_dlp_path)?;
        if local.ok() {
            Ok(local.to_frontend())
        }
        else {
            let global = DepsInfo::from_params(false, &appdata.mpv_path, &appdata.yt_dlp_path)?;
            if global.ok() {
                appdata.deps_managed = false;
                write_config(&appdata)?;
            }
            Ok(global.to_frontend())
        }
    }
    else {
        let di = DepsInfo::from_params(appdata.deps_managed, &appdata.mpv_path, &appdata.yt_dlp_path)?;
        Ok(di.to_frontend())
    }
}

#[tauri::command]
pub async fn get_target_family(state: tauri::State<'_, AppState>) -> Result<String> {
    Ok(std::env::consts::FAMILY.to_lowercase().to_string())
}

#[tauri::command]
pub async fn set_home_srv(state: tauri::State<'_, AppState>, home_srv: String) -> Result<()> {
    let mut appdata = state.appdata.write()?;

    //TODO: check url

    appdata.home_srv = Some(home_srv);
    write_config(&appdata)?;
    Ok(())
}