use std::sync::Arc;
use cfg_if::cfg_if;
use tauri::{Emitter};
use crate::appstate::AppState;
use crate::mpv::{gen_pipe_id, start_ipc, start_process, stop_ipc, stop_process, window};
use crate::mpv::ipc::Interface;
use crate::mpv::models::LoadFromSource;
use crate::mpv::window::HtmlElementRect;
use tokio::sync::mpsc;
use crate::result::Result;

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
    stop_process(&state, window).await?;
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
    cfg_if! {
        if #[cfg(target_family = "windows")] {
            window::win32::hide_borders(&state, mpv_wid).await?;
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn mpv_load_from_source(
    state: tauri::State<'_, Arc<AppState>>,
    data: String
) -> Result<()> {
    let data_obj: LoadFromSource = serde_json::from_str(&data)?;
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    mpv_ipc_tx.send(Interface::SetPause(true)).await?;

    let (loaded_sender, mut loaded_recv) = mpsc::channel::<()>(1);
    {
        let mut mpv_file_loaded_sender_wl = state.mpv_file_loaded_sender.write().await;
        *mpv_file_loaded_sender_wl = Some(loaded_sender);
    }

    mpv_ipc_tx.send(Interface::LoadFromSource {
        source_url: data_obj.source_url,
        jwt: data_obj.jwt
    }).await?;

    loaded_recv.recv().await;
    Ok(())
}

#[tauri::command]
pub async fn mpv_load_from_url(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {

    Ok(())
}