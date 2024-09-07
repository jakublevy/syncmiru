use std::sync::Arc;
use rust_decimal::Decimal;
use tauri::Window;
use crate::appstate::AppState;
use crate::mpv::ipc;
use crate::mpv::ipc::{Interface, IpcData};
use crate::result::Result;

pub async fn mpv_before_file_load(
    state: &Arc<AppState>,
    window: Window,
    playback_speed: &Decimal
) -> Result<()> {
    let ipc_data = IpcData { app_state: state.clone(), window };

    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    mpv_ipc_tx.send(Interface::ClearMessages).await?;

    let pause = ipc::get_pause(&ipc_data).await?;
    if !pause {
        let mut mpv_ignore_next_pause_true_event_wl =  state.mpv_ignore_next_pause_true_event.write().await;
        *mpv_ignore_next_pause_true_event_wl = true;
        mpv_ipc_tx.send(Interface::SetPause(true)).await?;
    }

    let speed = ipc::get_speed(&ipc_data).await?;
    if speed != *playback_speed {
        let mut mpv_ignore_next_speed_event_wl = state.mpv_ignore_next_speed_event.write().await;
        *mpv_ignore_next_speed_event_wl = true;
        mpv_ipc_tx.send(Interface::SetPlaybackSpeed(*playback_speed)).await?;
    }
    Ok(())
}