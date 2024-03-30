use std::thread::{available_parallelism, sleep};
use std::time::Duration;
use crate::appstate::AppState;
use crate::config::appdata::write_config;
use crate::config::{Language, utils};
use crate::deps::{DepsAvailable};
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
    //sleep(Duration::from_secs(10));
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
pub async fn get_deps_state(state: tauri::State<'_, AppState>) -> Result<DepsAvailable> {
    //sleep(Duration::from_secs(3));
    let mut appdata = state.appdata.write()?;
    if cfg!(target_family = "windows") {
        if appdata.deps_managed {
            let local = DepsAvailable::from_params(true)?;
            if local.all_available() {
                return Ok(local)
            }
        }
        let global = DepsAvailable::from_params(false)?;
        if global.all_available() {
            appdata.deps_managed = false;
            write_config(&appdata)?;
        }
        Ok(global)
    }
    else {
        let di = DepsAvailable::from_params(appdata.deps_managed)?;
        Ok(di)
    }
}

#[tauri::command]
pub async fn get_target_family() -> Result<String> {
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