use std::env;
use std::sync::Arc;
use anyhow::Context;
use tauri::Manager;
use tokio::sync::mpsc;
use tokio::sync::mpsc::{Sender, Receiver};
use tokio::task;
use crate::appstate::AppState;
use crate::mpv::{gen_pipe_id, ipc, start_process, stop_process, window};
use crate::result::Result;
use crate::window::WindowExt;

#[tauri::command]
pub async fn mpv_start(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    if !state.mpv_is_running().await {
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

        let mpv_id = state.read_mpv_wid().await;
        if mpv_detached {
            // TODO: set normal window size 960x480 (or 968x507) using ipc
        }
        else {
            let syncmiru_id = window
                .native_id()?
                .context("could not get tauri window id, possibly broken window system")?;

            window::hide_borders(mpv_id);
        //    window::reparent(mpv_id, syncmiru_id)?;
            // TODO: notify js, it will call handler with dimensions and the handler will call set position
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