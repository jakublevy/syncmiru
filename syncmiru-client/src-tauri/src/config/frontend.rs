//! This module provides Tauri commands for managing and retrieving application configuration.

use std::sync::Arc;
use tokio::time::sleep;
use std::time::Duration;
use cfg_if::cfg_if;
use crate::appstate::AppState;
use crate::config::{appdata, jwt, Theme};
use crate::config::{Language};
use crate::result::Result;
use crate::{mpv, sys};
use crate::mpv::ipc::IpcData;

/// Retrieves whether the first-run message has been seen by the user.
///
/// # Returns
/// `true` if the first-run message has been seen, otherwise `false`.
#[tauri::command]
pub async fn get_first_run_seen(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.first_run_seen)
}

/// Marks the first-run message as seen by the user.
///
/// Updates the application's persistent configuration to reflect this change.
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

/// Retrieves whether the list of users should be shown.
///
/// # Returns
/// `true` if the users list should be shown, otherwise `false`.
#[tauri::command]
pub async fn get_users_shown(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.users_shown)
}

/// Sets whether the list of users should be shown.
///
/// Updates the application's persistent configuration to reflect this change.
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

/// Retrieves whether audio synchronization is enabled.
///
/// # Returns
/// `true` if audio synchronization is enabled, otherwise `false`.
#[tauri::command]
pub async fn get_audio_sync(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.audio_sync)
}

/// Sets whether audio synchronization is enabled.
///
/// Updates the application's persistent configuration to reflect this change.
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

/// Retrieves whether subtitle synchronization is enabled.
///
/// # Returns
/// `true` if subtitle synchronization is enabled, otherwise `false`.
#[tauri::command]
pub async fn get_sub_sync(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.sub_sync)
}

/// Sets whether subtitle synchronization is enabled.
///
/// Updates the application's persistent configuration to reflect this change.
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

/// Retrieves the current language setting of the application.
///
/// # Returns
/// The language setting as a `Language` enum value.
#[tauri::command]
pub async fn get_language(state: tauri::State<'_, Arc<AppState>>) -> Result<Language> {
    let appdata = state.appdata.read().await;
    Ok(appdata.lang)
}

/// Sets the language for the application.
///
/// Updates the application's persistent configuration and sets the runtime locale.
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

/// Retrieves the target platform family (e.g., "windows", "linux").
///
/// # Returns
/// A string representing the platform family.
#[tauri::command]
pub async fn get_target_family() -> Result<String> {
    Ok(std::env::consts::FAMILY.to_string())
}

/// Retrieves the JWT used for authentication.
///
/// # Returns
/// The JWT as a string, or an empty string if not set.
#[tauri::command]
pub async fn get_jwt() -> Result<String> {
    Ok(jwt::read()?.unwrap_or("".to_string()))
}

/// Clears the stored JWT.
#[tauri::command]
pub async fn clear_jwt() -> Result<()> {
    jwt::clear()
}

/// Retrieves the hashed hardware ID of the system.
///
/// # Returns
/// A string containing the hashed hardware ID.
#[tauri::command]
pub async fn get_hwid_hash() -> Result<String> { sys::id_hashed() }

/// Retrieves whether the mpv window is detached.
///
/// # Returns
/// `true` if the window is detached, otherwise `false`.
#[tauri::command]
pub async fn get_mpv_win_detached(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    Ok(appdata.mpv_win_detached)
}

/// Sets whether the mpv window is detached.
///
/// Handles detaching or attaching the mpv window based on the provided parameter.
#[tauri::command]
pub async fn set_mpv_win_detached(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window, mpv_win_detach_req: bool) -> Result<()> {
    {
        let mut mpv_reattach_on_fullscreen_false_wl = state.mpv_reattach_on_fullscreen_false.write().await;
        *mpv_reattach_on_fullscreen_false_wl = false;
    }
    let mpv_running_rl = state.mpv_stop_tx.read().await;
    let mpv_running = mpv_running_rl.is_some();

    if mpv_running {
        let mpv_wid_rl = state.mpv_wid.read().await;
        let mpv_wid = mpv_wid_rl.unwrap();

        if mpv_win_detach_req {
            mpv::window::detach(&state, mpv_wid).await?;
        }
        else {
            cfg_if! {
                if #[cfg(target_family = "windows")] {
                    mpv::ipc::win32::make_fullscreen_false_if_not(&IpcData { app_state: state.inner().clone(), window: window.clone() }).await?;
                    sleep(Duration::from_millis(50)).await;
                }
            }
            mpv::window::attach(&state, &window, mpv_wid).await?;
        }
    }
    {
        let mut appdata = state.appdata.write().await;
        appdata.mpv_win_detached = mpv_win_detach_req;
    }
    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}

/// Sets the theme for the application.
///
/// Updates the application's persistent configuration to reflect the selected theme.
#[tauri::command]
pub async fn set_theme(state: tauri::State<'_, Arc<AppState>>, theme: Theme) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.theme = theme;
    }

    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}