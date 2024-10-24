pub mod frontend;
pub mod ipc;
pub mod window;
mod models;
mod utils;

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::{Duration, SystemTime};
use anyhow::anyhow;
use cfg_if::cfg_if;
use tauri::{Emitter, Window};
use thiserror::__private::AsDisplay;
use tokio::sync::{oneshot};
use crate::appstate::AppState;
use crate::deps::utils::{mpv_exe, prelude_path, yt_dlp_exe};
use crate::{constants, hash};
use crate::result::Result;
use tokio::process::Command;
use tokio::sync::mpsc;
use tokio::sync::mpsc::{Sender, Receiver};
use tokio::task;
use tokio::time::sleep;
use crate::error::SyncmiruError;
use crate::mpv::ipc::Interface;

pub fn init_prelude(prelude_resource_path: impl AsRef<Path>) -> Result<()> {
    let prelude_p = prelude_path()?;
    let mut prelude_hash = "".to_string();
    if prelude_p.exists() {
       prelude_hash = hash::of_file(prelude_p.as_path())?;
    }
    let correct_hash = hash::of_file(&prelude_resource_path)?;
    if prelude_hash != correct_hash {
        fs::copy(prelude_resource_path, prelude_p)?;
    }
    Ok(())
}

pub async fn start_process(state: &Arc<AppState>, pipe_id: &str, window: tauri::Window) -> Result<()> {
    let mut mpv_exe_path = PathBuf::from("mpv");
    let mut yt_dlp_path = PathBuf::from("yt-dlp");
    {
        let appdata_rl = state.appdata.read().await;
        if appdata_rl.deps_managed {
            mpv_exe_path = mpv_exe()?;
            yt_dlp_path = yt_dlp_exe()?;
        }
    }

    let ipcserver = get_input_ipc_server(pipe_id);

    let mut process_handle = Command::new(mpv_exe_path)
        .arg(format!("--script={}", &prelude_path()?.display()))
        .arg(format!("--input-ipc-server={}", ipcserver))
        .arg("--no-window-dragging")
        .arg("--idle")
        .arg("--force-window")
        .arg("--drag-and-drop=no")
        .arg("--hr-seek=yes")
        .arg("--osd-margin-y=150")
        .arg("--fullscreen=no")
        .arg("--window-minimized=no")
        .arg("--window-maximized=no")
        .arg("--keep-open=yes")
        .arg("--cache-pause=no")
        .arg("--auto-window-resize=no")
        .arg(format!("--script-opts=ytdl_hook-ytdl_path={}", yt_dlp_path.as_display()))
        .arg("--terminal=no")
        .spawn()?;

    let pid = process_handle.id().expect("missing process id");

    cfg_if! {
        if #[cfg(target_family = "unix")] {
            if *constants::SUPPORTED_WINDOW_SYSTEM.get().unwrap() {
                window::init_connection(state).await?;
            }
        }
    }

    {
        let mut mpv_not_ready_msg_id_wl = state.mpv_not_ready_msg_id.write().await;
        let mut mpv_loading_msg_id_wl = state.mpv_loading_msg_id.write().await;
        *mpv_not_ready_msg_id_wl = None;
        *mpv_loading_msg_id_wl = None;
    }

    if *constants::SUPPORTED_WINDOW_SYSTEM.get().unwrap() {
        let mpv_wid_opt = window::pid2wid(state, pid).await?;
        {
            let mut mpv_wid_wl = state.mpv_wid.write().await;
            *mpv_wid_wl = Some(mpv_wid_opt.expect("missing mpv window"));
        }
    }

    let (tx, rx) = oneshot::channel::<()>();
    {
        let mut mpv_tx_wl = state.mpv_stop_tx.write().await;
        *mpv_tx_wl = Some(tx);
    }
    let state_for_process = state.clone();
    tokio::spawn(async move {
       tokio::select! {
           result = process_handle.wait() => match result {
               Ok(_) => {
                   let mut mpv_tx_wl = state_for_process.mpv_stop_tx.write().await;
                   mpv_tx_wl.take();

                   on_mpv_stopped(&state_for_process, window).await.expect("tauri error");
               },
               Err(_) => panic!("Error while waiting for process")
           },
           _ = rx => {
               process_handle.kill().await.expect("kill error");

               on_mpv_stopped(&state_for_process, window).await.expect("tauri error");
           }
       }
    });

    Ok(())
}

pub async fn stop_process(state: &Arc<AppState>) -> Result<()> {
    let mut mpv_tx_wl = state.mpv_stop_tx.write().await;
    let tx_opt = mpv_tx_wl.take();
    if let Some(tx) = tx_opt {
        tx.send(()).map_err(|_| anyhow!("killing process failed"))?;
    }
    Ok(())
}

pub async fn start_ipc(state: &Arc<AppState>, pipe_id: &str, window: tauri::Window) -> Result<()> {
    let (tx, rx): (Sender<Interface>, Receiver<Interface>) = mpsc::channel(1);
    {
        let mut mpv_ipc_tx_wl = state.mpv_ipc_tx.write().await;
        *mpv_ipc_tx_wl = Some(tx);
    }
    if crate::window::is_wayland() {
        let pipe_path = get_pipe_ipc_path(pipe_id);
        let max_wait = 1000;
        let mut waited = 0;
        while waited < max_wait {
            if Path::new(&pipe_path).exists() {
                break;
            }
            sleep(Duration::from_millis(10)).await;
            waited += 10;
        }
        if waited == max_wait {
            return Err(SyncmiruError::MpvIpcNotRunning)
        }
    }
    task::spawn(ipc::start(rx, pipe_id.to_string(), window, state.clone()));
    Ok(())
}

pub async fn stop_ipc(state: &Arc<AppState>) -> Result<()> {
    let mut mpv_ipc_tx_wl = state.mpv_ipc_tx.write().await;
    let tx_opt = mpv_ipc_tx_wl.take();
    if let Some(tx) = tx_opt {
        tx.send(Interface::Exit).await?;
    }
    Ok(())
}

pub fn gen_pipe_id() -> String {
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(std::time::UNIX_EPOCH)
        .expect("time went backwards");

    format!("mpvipc-{}", since_the_epoch.as_nanos().to_string())
}

pub fn get_input_ipc_server(pipe_id: &str) -> String {
    let mut ipcserver = format!("/tmp/{}.sock", pipe_id);
    if cfg!(target_family = "windows") {
        ipcserver = format!("\\\\.\\pipe\\{}", pipe_id)
    }
    ipcserver
}

pub fn get_pipe_ipc_path(pipe_id: &str) -> String {
    let mut ipcserver = format!("/tmp/{}.sock", pipe_id);
    if cfg!(target_family = "windows") {
        ipcserver = pipe_id.to_string();
    }
    ipcserver
}

pub async fn on_mpv_stopped(state: &Arc<AppState>, window: Window) -> Result<()> {
    let mut mpv_ipc_tx_wl = state.mpv_ipc_tx.write().await;
    if let Some(mpv_ipc_tx) = mpv_ipc_tx_wl.take() {
        mpv_ipc_tx.send(Interface::Exit).await.ok();
    }
    window.emit("mpv-running", false)?;

    let mut mpv_reattach_on_fullscreen_false_wl = state.mpv_reattach_on_fullscreen_false.write().await;
    if *mpv_reattach_on_fullscreen_false_wl {
        let mut appdata_wl = state.appdata.write().await;
        window.emit("mpv-win-detached-changed", false)?;
        appdata_wl.mpv_win_detached = false;
        *mpv_reattach_on_fullscreen_false_wl = false;
    }
    Ok(())
}