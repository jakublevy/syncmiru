pub mod frontend;
mod ipc;
mod window;

use std::fs;
use std::path::PathBuf;
use std::process::{Child, Command};
use std::time::{SystemTime};
use tauri::{Manager, State};
use tokio::sync::{oneshot, RwLock};
use crate::appstate::AppState;
use crate::constants::PRELUDE_LOCATION;
use crate::deps::utils::{mpv_exe, prelude_path};
use crate::hash;
use crate::result::Result;
use tokio::task;

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

pub async fn start_process(state: &AppState, pipe_id: &str, window: tauri::Window) -> Result<()> {
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

    let process_handle = Command::new(mpv_exe_path)
        .arg(format!("--script={}", &prelude_path()?.display()))
        .arg(format!("--input-ipc-server={}", ipcserver))
        .arg("--no-window-dragging")
        .arg("--idle")
        .arg("--force-window")
        .arg("--drag-and-drop=no")
        .arg("--osd-align-y=bottom")
        .arg("--osd-margin-y=100")
        .arg("--fullscreen=no")
        .arg("--geometry=1x1+1+1")
        .arg("--keep-open=yes")
        .spawn()?;

    {
        let mut mpv_handle_wl = state.mpv_handle.write().await;
        *mpv_handle_wl = Some(process_handle);
    }
    task::spawn(wait_for_mpv_stop(&state.mpv_handle, window));

    Ok(())
}

pub fn stop_process() -> Result<()> {
    Ok(())
}

pub fn gen_pipe_id() -> String {
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(std::time::UNIX_EPOCH)
        .expect("time went backwards");

    format!("mpvipc-{}", since_the_epoch.as_nanos().to_string())
}

async fn wait_for_mpv_stop(mpv_process_l: &RwLock<Option<Child>>, window: tauri::Window) -> Result<()> {
    let mut mpv_process = mpv_process_l.write().await;
    let child = mpv_process.as_mut().unwrap();
    child.wait().expect("wait failed");
    window.emit("mpv-stop", {})?;
    Ok(())
}

enum Iface {
    Play,
    Pause,
    Seek { timestamp: u64 },
    ChangeAudion { aid: u64 },
    ChangeSubs { sid: u64 },
}
