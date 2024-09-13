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

    let audio_delay = ipc::get_audio_delay(&ipc_data).await?;
    if audio_delay != 0f64 {
        let mut mpv_ignore_next_audio_delay_event_wl = state.mpv_ignore_next_audio_delay_event.write().await;
        *mpv_ignore_next_audio_delay_event_wl = true;
        mpv_ipc_tx.send(Interface::SetAudioDelay(0f64)).await?;
    }

    let sub_delay = ipc::get_sub_delay(&ipc_data).await?;
    if sub_delay != 0f64 {
        let mut mpv_ignore_next_sub_delay_event_wl = state.mpv_ignore_next_sub_delay_event.write().await;
        *mpv_ignore_next_sub_delay_event_wl = true;
        mpv_ipc_tx.send(Interface::SetSubDelay(0f64)).await?;
    }

    {
        let mut mpv_ignore_next_audio_change_event_wl = state.mpv_ignore_next_audio_change_event.write().await;
        *mpv_ignore_next_audio_change_event_wl = true;
    }
    {
        let mut mpv_ignore_next_sub_change_event_wl = state.mpv_ignore_next_sub_change_event.write().await;
        *mpv_ignore_next_sub_change_event_wl = true;
    }
    Ok(())
}