use std::sync::Arc;
use tauri::Manager;
use tokio::sync::mpsc;
use tokio::sync::mpsc::{Sender, Receiver};
use tokio::task;
use crate::appstate::AppState;
use crate::mpv::{gen_pipe_id, ipc, start_process, stop_process, window};
use crate::mpv::window::HtmlElementRect;
use crate::result::Result;

#[tauri::command]
pub async fn mpv_start(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    let mpv_running_rl = state.mpv_stop_tx.read().await;
    let mpv_running = mpv_running_rl.is_some();

    if !mpv_running {
        drop(mpv_running_rl);

        let pipe_id = gen_pipe_id();
        start_process(&state, &pipe_id, window.clone()).await?;

        let (tx, rx): (Sender<ipc::Interface>, Receiver<ipc::Interface>) = mpsc::channel(1024);
        {
            let mut mpv_ipc_tx_wl = state.mpv_ipc_tx.write().await;
            *mpv_ipc_tx_wl = Some(tx);
        }

        task::spawn(ipc::start(rx, pipe_id, window.clone()));

        let mut mpv_detached = true;
        {
            let appdata = state.appdata.read().await;
            mpv_detached = appdata.mpv_win_detached;
        }

        let mpv_wid_rl = state.mpv_wid.read().await;
        let mpv_wid = mpv_wid_rl.unwrap();

        if mpv_detached {
            // TODO: set normal window size 960x480 (or 968x507) using ipc
        }
        else {
            window::attach(&state, &window, mpv_wid).await?;
        }

        window.emit("mpv-running", true)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn mpv_quit(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
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

