use std::sync::Arc;
use std::time::Duration;
use cfg_if::cfg_if;
use rust_decimal::Decimal;
use tauri::{Emitter, LogicalSize};
use crate::appstate::{AppState, MpvMsg};
use crate::mpv::{gen_pipe_id, start_ipc, start_process, stop_ipc, stop_process, utils, window};
use crate::mpv::ipc::{get_aid, get_sid, Interface, IpcData, MsgMood};
use crate::mpv::models::{LoadFromSource, LoadFromUrl, UserLoadedInfo};
use crate::mpv::window::HtmlElementRect;
use tokio::time::{sleep, Instant};
use crate::result::Result;
use mpv::ipc;
use crate::mpv;

#[tauri::command]
pub async fn mpv_start(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    let mpv_running_rl = state.mpv_stop_tx.read().await;
    let mpv_running = mpv_running_rl.is_some();

    if !mpv_running {
        drop(mpv_running_rl);

        {
            let mut mpv_ignore_next_pause_false_event_wl = state.mpv_ignore_next_pause_false_event.write().await;
            *mpv_ignore_next_pause_false_event_wl = true;
        }
        {
            let mut mpv_ignore_next_speed_event_wl = state.mpv_ignore_next_speed_event.write().await;
            *mpv_ignore_next_speed_event_wl = true;
        }
        {
            let mut mpv_ignore_next_audio_delay_event_wl = state.mpv_ignore_next_audio_delay_event.write().await;
            *mpv_ignore_next_audio_delay_event_wl = true;

        }
        {
            let mut mpv_ignore_next_sub_delay_event_wl = state.mpv_ignore_next_sub_delay_event.write().await;
            *mpv_ignore_next_sub_delay_event_wl = true;
        }

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

    window.emit("mpv-reported-speed-change", None::<Decimal>)?;
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
pub async fn mpv_wrapper_size_changed(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    wrapper_size: HtmlElementRect
) -> Result<()> {
    let mpv_wid_rl = state.mpv_wid.read().await;
    let mpv_wid = mpv_wid_rl.unwrap();

    cfg_if! {
        if #[cfg(target_family = "windows")] {
            window::win32::hide_borders(&state, mpv_wid).await?;
            sleep(Duration::from_millis(50)).await;
        }
    }
    let mut factor = window.scale_factor()?;
    cfg_if! {
        if #[cfg(target_family = "unix")] {
            if factor == 1f64 {
                factor = mpv::window::x11::get_scale_factor(&state).await?;
            }
        }
    }

    let scaled_wrapper_size = HtmlElementRect {
        x: wrapper_size.x * factor,
        y: wrapper_size.y * factor,
        width: wrapper_size.width * factor,
        height: wrapper_size.height * factor
    };
    window::reposition(&state, mpv_wid, &scaled_wrapper_size).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_reposition_to_small(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<()> {
    let mpv_wid_rl = state.mpv_wid.read().await;
    let mpv_wid = mpv_wid_rl.unwrap();

    let mut factor = window.scale_factor()?;
    cfg_if! {
        if #[cfg(target_family = "unix")] {
            if factor == 1f64 {
                factor = mpv::window::x11::get_scale_factor(&state).await?;
            }
        }
    }

    let size = window.inner_size()?;
    let offset = 10.0 * factor;
    let x = size.width as f64 / 2.0 + 384.0*factor + offset;
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

    utils::mpv_before_file_load(&state, window, &data_obj.playback_speed).await?;

    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
    mpv_ipc_tx.send(Interface::LoadFromSource {
        source_url: data_obj.source_url,
        jwt: data_obj.jwt
    }).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_load_from_url(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    data: String
) -> Result<()> {
    let data_obj: LoadFromUrl = serde_json::from_str(&data)?;

    utils::mpv_before_file_load(&state, window, &data_obj.playback_speed).await?;

    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    mpv_ipc_tx.send(Interface::LoadFromUrl(data_obj.url)).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_remove_current_from_playlist(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
    mpv_ipc_tx.send(Interface::PlaylistRemoveCurrent).await?;
    window.emit("mpv-reported-speed-change", None::<Decimal>)?;
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
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut pause_ignore = &state.mpv_ignore_next_pause_true_event;
    if !pause {
        pause_ignore = &state.mpv_ignore_next_pause_false_event;
    }

    let mpv_pause = ipc::get_pause(&ipc_data).await?;
    if mpv_pause != pause {
        let mut pause_ignore_lock = pause_ignore.write().await;
        *pause_ignore_lock = true;

        mpv_ipc_tx.send(Interface::SetPause(pause)).await?;
    }
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

#[tauri::command]
pub async fn mpv_show_ready_messages(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    loading: Vec<String>,
    not_ready: Vec<String>
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let everyone_ready = loading.is_empty() && not_ready.is_empty();

    mpv_ipc_tx.send(Interface::ShowNotReadyMsg(not_ready)).await?;
    mpv_ipc_tx.send(Interface::ShowLoadingMsg(loading)).await?;

    let mut mpv_everyone_ready_msg_id_wl = state.mpv_everyone_ready_msg_id.write().await;
    if everyone_ready {
        let msg_id = state.get_mpv_next_req_id().await;
        mpv_ipc_tx.send(Interface::ShowMsg {
            id: msg_id,
            text: String::from(t!("mpv-everyone-ready")),
            duration: 5f64,
            mood: MsgMood::Good
        }).await?;
        *mpv_everyone_ready_msg_id_wl = Some(msg_id);
    }
    else {
        if let Some(msg_id) = *mpv_everyone_ready_msg_id_wl {
            mpv_ipc_tx.send(Interface::DeleteMsg(msg_id)).await?;
            *mpv_everyone_ready_msg_id_wl = None;
        }
    }
    Ok(())
}

#[tauri::command]
pub async fn mpv_hide_ready_messages(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    mpv_ipc_tx.send(Interface::ShowNotReadyMsg(vec![])).await?;
    mpv_ipc_tx.send(Interface::ShowLoadingMsg(vec![])).await?;

    Ok(())
}

#[tauri::command]
pub async fn mpv_show_msg(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    text: String,
    duration: f64,
    mood: MsgMood
) -> Result<()> {
    let msg_id = state.get_mpv_next_req_id().await;

    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    if let Some(mpv_ipc_tx) = mpv_ipc_tx_rl.as_ref() {
        if mood == MsgMood::Neutral {
            let mut mpv_neutral_msgs_wl = state.mpv_neutral_msgs.write().await;
            let mut shown_msgs = mpv_neutral_msgs_wl
                .iter()
                .filter(|&x| x.is_shown())
                .map(|&x| x.clone())
                .collect::<Vec<MpvMsg>>();

            if shown_msgs.len() == 3 {
                let msg_to_del = shown_msgs.remove(0);
                mpv_ipc_tx.send(Interface::DeleteMsg(msg_to_del.id)).await?;
            }
            shown_msgs.push(MpvMsg { id: msg_id, duration, timestamp: Instant::now() });
            *mpv_neutral_msgs_wl = shown_msgs;
        }
        mpv_ipc_tx.send(Interface::ShowMsg { id: msg_id, text, duration, mood }).await?;
    }
    Ok(())
}

#[tauri::command]
pub async fn mpv_set_speed(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    speed: Decimal,
) -> Result<()> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mpv_speed = ipc::get_speed(&ipc_data).await?;
    if speed != mpv_speed {
        let mut mpv_ignore_next_speed_event_wl = state.mpv_ignore_next_speed_event.write().await;
        *mpv_ignore_next_speed_event_wl = true;
        mpv_ipc_tx.send(Interface::SetPlaybackSpeed(speed)).await?;
    }
    Ok(())
}

#[tauri::command]
pub async fn mpv_get_audio(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<Option<u64>> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let aid = ipc::get_aid(&ipc_data).await?;
    Ok(aid)
}

#[tauri::command]
pub async fn mpv_set_audio(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    aid: Option<u64>
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut mpv_ignore_next_audio_change_event_wl = state.mpv_ignore_next_audio_change_event.write().await;
    *mpv_ignore_next_audio_change_event_wl = true;
    mpv_ipc_tx.send(Interface::SetAudio(aid)).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_get_sub(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<Option<u64>> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let sid = ipc::get_sid(&ipc_data).await?;
    Ok(sid)
}

#[tauri::command]
pub async fn mpv_set_sub(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    sid: Option<u64>
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut mpv_ignore_next_sub_change_event_wl = state.mpv_ignore_next_sub_change_event.write().await;
    *mpv_ignore_next_sub_change_event_wl = true;
    mpv_ipc_tx.send(Interface::SetSub(sid)).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_get_audio_delay(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<f64> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let audio_delay = ipc::get_audio_delay(&ipc_data).await?;
    Ok(audio_delay)
}

#[tauri::command]
pub async fn mpv_set_audio_delay(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    audio_delay: f64
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut mpv_ignore_next_audio_delay_event_wl = state.mpv_ignore_next_audio_delay_event.write().await;
    *mpv_ignore_next_audio_delay_event_wl = true;
    mpv_ipc_tx.send(Interface::SetAudioDelay(audio_delay)).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_get_sub_delay(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<f64> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let sub_delay = ipc::get_sub_delay(&ipc_data).await?;
    Ok(sub_delay)
}

#[tauri::command]
pub async fn mpv_set_sub_delay(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    sub_delay: f64
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut mpv_ignore_next_sub_delay_event_wl = state.mpv_ignore_next_sub_delay_event.write().await;
    *mpv_ignore_next_sub_delay_event_wl = true;
    mpv_ipc_tx.send(Interface::SetSubDelay(sub_delay)).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_clear_msgs(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    mpv_ipc_tx.send(Interface::ClearMessages).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_increase_playback_speed(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    playback_speed_plus: Decimal
) -> Result<()> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let speed = ipc::get_speed(&ipc_data).await?;
    let mut mpv_ignore_next_speed_event_wl = state.mpv_ignore_next_speed_event.write().await;
    *mpv_ignore_next_speed_event_wl = true;
    mpv_ipc_tx.send(Interface::SetPlaybackSpeed(speed + playback_speed_plus)).await?;
    Ok(())
}

#[tauri::command]
pub async fn mpv_decrease_playback_speed(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
    playback_speed_minus: Decimal
) -> Result<()> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let speed = ipc::get_speed(&ipc_data).await?;
    let mut mpv_ignore_next_speed_event_wl = state.mpv_ignore_next_speed_event.write().await;
    *mpv_ignore_next_speed_event_wl = true;
    mpv_ipc_tx.send(Interface::SetPlaybackSpeed(speed - playback_speed_minus)).await?;
    Ok(())
}