use std::sync::Arc;
use std::time::Duration;
use cfg_if::cfg_if;
use tauri::{Emitter};
use crate::appstate::AppState;
use crate::mpv::{gen_pipe_id, start_ipc, start_process, stop_ipc, stop_process, utils, window};
use crate::mpv::ipc::{get_aid, get_sid, Interface, IpcData};
use crate::mpv::models::{LoadFromSource, UserLoadedInfo};
use crate::mpv::window::HtmlElementRect;
use tokio::time::sleep;
use crate::result::Result;
use mpv::ipc;
use crate::mpv;

#[tauri::command]
pub async fn mpv_start(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    let mpv_running_rl = state.mpv_stop_tx.read().await;
    let mpv_running = mpv_running_rl.is_some();

    if !mpv_running {
        drop(mpv_running_rl);

        let pipe_id = gen_pipe_id();
        start_process(&state, &pipe_id, window.clone()).await?;
        start_ipc(&state, &pipe_id, window.clone()).await?;

        let mut mpv_detached = true;
        {
            let appdata = state.appdata.read().await;
            mpv_detached = appdata.mpv_win_detached;
        }

        let mpv_wid_rl = state.mpv_wid.read().await;
        let mpv_wid = mpv_wid_rl.unwrap();

        if !mpv_detached {
            window::attach(&state, &window, mpv_wid).await?;
        }
        window.emit("mpv-running", true)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn mpv_quit(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    stop_ipc(&state).await?;
    stop_process(&state).await?;

    let mut mpv_reattach_on_fullscreen_false_wl = state.mpv_reattach_on_fullscreen_false.write().await;
    if *mpv_reattach_on_fullscreen_false_wl {
        *mpv_reattach_on_fullscreen_false_wl = false;
        let mut appdata_wl = state.appdata.write().await;
        appdata_wl.mpv_win_detached = false;
    }
    Ok(())
}

#[tauri::command]
pub async fn get_is_supported_window_system() -> Result<bool> {
    crate::window::is_supported_window_system().await
}

#[tauri::command]
pub async fn mpv_wrapper_size_changed(state: tauri::State<'_, Arc<AppState>>, wrapper_size: HtmlElementRect) -> Result<()> {
    let mpv_wid_rl = state.mpv_wid.read().await;
    let mpv_wid = mpv_wid_rl.unwrap();

    cfg_if! {
        if #[cfg(target_family = "windows")] {
            window::win32::hide_borders(&state, mpv_wid).await?;
            sleep(Duration::from_millis(50)).await;
        }
    }
    window::reposition(&state, mpv_wid, &wrapper_size).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_reposition_to_small(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    let mpv_wid_rl = state.mpv_wid.read().await;
    let mpv_wid = mpv_wid_rl.unwrap();

    let size = window.inner_size()?;
    let offset = 10.0;
    let x = size.width as f64 / 2.0 + 384.0 + offset;
    let w = size.width as f64 - x - 2.0*offset;
    let h = w / 16.0 * 9.0;
    let y = size.height as f64 - offset - h;

    window::reposition(&state, mpv_wid, &HtmlElementRect {
        x,
        y,
        width: w,
        height: h,
    }).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_load_from_source(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    data: String
) -> Result<()> {
    let data_obj: LoadFromSource = serde_json::from_str(&data)?;

    utils::mpv_pause_if_not(&state, window).await?;

    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
    mpv_ipc_tx.send(Interface::LoadFromSource {
        source_url: data_obj.source_url,
        jwt: data_obj.jwt
    }).await?;

    // TODO: set room default playback speed
    Ok(())
}

#[tauri::command]
pub async fn mpv_load_from_url(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    url: String
) -> Result<()> {
    utils::mpv_pause_if_not(&state, window).await?;

    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    mpv_ipc_tx.send(Interface::LoadFromUrl(url)).await?;

    // TODO: set room default playback speed
    Ok(())
}

#[tauri::command]
pub async fn mpv_remove_current_from_playlist(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
    mpv_ipc_tx.send(Interface::PlaylistRemoveCurrent).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_get_loaded_info(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<UserLoadedInfo> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let aid = get_aid(&ipc_data).await?;
    let sid = get_sid(&ipc_data).await?;
    let mut audio_sync = false;
    let mut sub_sync = false;
    {
        let appdata = ipc_data.app_state.appdata.read().await;
        audio_sync = appdata.audio_sync;
        sub_sync = appdata.sub_sync;
    }

    let user_loaded_info = UserLoadedInfo {
        aid,
        sid,
        audio_sync,
        sub_sync,
    };
    Ok(user_loaded_info)
}

#[tauri::command]
pub async fn mpv_set_pause(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    pause: bool
) -> Result<()> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    ipc::set_pause(pause, &ipc_data).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_get_timestamp(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<f64> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let time = ipc::get_timestamp(&ipc_data).await?;
    Ok(time)
}

#[tauri::command]
pub async fn mpv_seek(
    state: tauri::State<'_, Arc<AppState>>,
    timestamp: f64
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
    let mut mpv_ignore_next_seek_event_wl = state.mpv_ignore_next_seek_event.write().await;
    *mpv_ignore_next_seek_event_wl = true;
    mpv_ipc_tx.send(Interface::Seek(timestamp)).await?;
    Ok(())
}