use std::sync::Arc;
use tauri::Window;
use crate::appstate::AppState;
use crate::mpv::ipc;
use crate::mpv::ipc::{Interface, IpcData};
use crate::result::Result;

pub async fn mpv_pause_if_not(state: &Arc<AppState>, window: Window) -> Result<()> {
    let ipc_data = IpcData { app_state: state.clone(), window };

    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let pause = ipc::get_pause(&ipc_data).await?;
    if !pause {
        let mut mpv_ignore_next_pause_true_event_wl =  state.mpv_ignore_next_pause_true_event.write().await;
        *mpv_ignore_next_pause_true_event_wl = true;
        mpv_ipc_tx.send(Interface::SetPause(true)).await?;
    }
    Ok(())
}