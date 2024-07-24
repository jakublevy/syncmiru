pub mod frontend;
pub mod ipc;
pub mod window;

use std::fs;
use std::ops::Deref;
use std::path::PathBuf;
use std::sync::Arc;
use std::thread::sleep;
use std::time::{Duration, SystemTime};
use anyhow::anyhow;
use tauri::{Manager, State};
use tokio::io::AsyncWriteExt;
use tokio::sync::{Mutex, oneshot, RwLock};
use crate::appstate::AppState;
use crate::constants::PRELUDE_LOCATION;
use crate::deps::utils::{mpv_exe, prelude_path};
use crate::hash;
use crate::result::Result;
use tokio::task;
use tokio::process::Command;

pub fn init_prelude() -> Result<()> {
    let prelude_p = prelude_path()?;
    let mut prelude_hash = "".to_string();
    if prelude_p.exists() {
       prelude_hash = hash::of_file(prelude_p.as_path())?;
    }
    let correct_hash = hash::of_file(&PRELUDE_LOCATION)?;
    if prelude_hash != correct_hash {
        fs::copy(PRELUDE_LOCATION, prelude_p)?;
    }
    Ok(())
}

pub async fn start_process(state: &Arc<AppState>, pipe_id: &str, window: tauri::Window) -> Result<()> {
    let mut mpv_exe_path = PathBuf::from("mpv");
    {
        let appdata_rl = state.appdata.read().await;
        if appdata_rl.deps_managed {
            mpv_exe_path = mpv_exe()?
        }
    }
    let mut ipcserver = format!("/tmp/mpvipc-{}", pipe_id);
    if cfg!(target_family = "windows") {
        ipcserver = format!("\\\\.\\pipe\\mpvipc-{}", pipe_id);
    }

    let mut process_handle = Command::new(mpv_exe_path)
        .arg(format!("--script={}", &prelude_path()?.display()))
        .arg(format!("--input-ipc-server={}", ipcserver))
        .arg("--no-window-dragging")
        .arg("--idle")
        .arg("--force-window")
        .arg("--drag-and-drop=no")
        .arg("--osd-align-y=bottom")
        .arg("--osd-margin-y=100")
        .arg("--fullscreen=no")
        .arg("--window-minimized=no")
        .arg("--window-maximized=no")
    //    .arg("--geometry=1x1+1+1")
        .arg("--keep-open=yes")
        .spawn()?;

    let pid = process_handle.id().expect("missing process id");

    cfg_if::cfg_if! {
        if #[cfg(target_family = "unix")] {
            window::init_connection(state).await?;
        }
    }

    let mpv_wid_opt = window::pid2wid(state, pid).await?;
    {
        let mut mpv_wid_wl = state.mpv_wid.write().await;
        *mpv_wid_wl = Some(mpv_wid_opt.expect("missing mpv window"));
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
                   window.emit("mpv-running", false).expect("tauri error")
               },
               Err(_) => panic!("Error while waiting for process")
           },
           _ = rx => { process_handle.kill().await.expect("kill error"); }
       }
    });

    Ok(())
}

pub async fn stop_process(state: &Arc<AppState>, window: tauri::Window) -> Result<()> {
    let mut mpv_tx_rl = state.mpv_stop_tx.write().await;
    let tx_opt= mpv_tx_rl.take();
    if let Some(tx) = tx_opt {
        tx.send(()).map_err(|e| anyhow!("killing process failed"))?;
    }
    Ok(())
}

pub fn gen_pipe_id() -> String {
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(std::time::UNIX_EPOCH)
        .expect("time went backwards");

    format!("mpvipc-{}", since_the_epoch.as_nanos().to_string())
}

enum Iface {
    Play,
    Pause,
    Seek { timestamp: u64 },
    ChangeAudion { aid: u64 },
    ChangeSubs { sid: u64 },
}
