//! This module provides a frontend interface for controlling the mpv player through Tauri commands.

use std::sync::Arc;
use cfg_if::cfg_if;
use rust_decimal::Decimal;
use tauri::{Emitter};
use crate::appstate::{AppState, MpvMsg};
use crate::mpv::{gen_pipe_id, on_mpv_stopped, start_ipc, start_process, stop_ipc, stop_process, utils, window};
use crate::mpv::ipc::{Interface, IpcData, MsgMood};
use crate::mpv::models::{LoadFromSource, LoadFromUrl, UserLoadedInfo};
use crate::mpv::window::HtmlElementRect;
use tokio::time::{Instant};
use crate::result::Result;
use mpv::ipc;
use crate::{constants, mpv};

#[cfg(target_family = "windows")]
use tokio::time::{sleep, Duration};


/// Starts mpv process and its IPC communication.
/// Initializes state variables for event handling.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window instance.
///
/// # Returns
/// - `Result<()>`: An empty result on success or an error if the operation fails.
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

        if *constants::SUPPORTED_WINDOW_SYSTEM.get().unwrap() {
            let mpv_wid_rl = state.mpv_wid.read().await;
            let mpv_wid = mpv_wid_rl.unwrap();

            if !mpv_detached {
                window::attach(&state, &window, mpv_wid).await?;
            }
        }
        window.emit("mpv-running", true)?;
    }
    Ok(())
}


/// Stops mpv process and its IPC communication.
/// Resets specific application state flags.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window instance.
///
/// # Returns
/// - `Result<()>`: An empty result on success or an error if the operation fails.
#[tauri::command]
pub async fn mpv_quit(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    stop_ipc(&state).await?;
    stop_process(&state).await?;

    window.emit("mpv-reported-speed-change", None::<Decimal>)?;
    let mut mpv_reattach_on_fullscreen_false_wl = state.mpv_reattach_on_fullscreen_false.write().await;
    if *mpv_reattach_on_fullscreen_false_wl {
        let mut appdata_wl = state.appdata.write().await;
        appdata_wl.mpv_win_detached = false;
        *mpv_reattach_on_fullscreen_false_wl = false;
        window.emit("mpv-restore-detached-state", {})?;
    }
    Ok(())
}


/// Checks if the current window system is supported for operations with mpv window.
///
/// # Returns
/// - `Result<bool>`: `true` if supported, `false` otherwise.
#[tauri::command]
pub async fn get_is_supported_window_system() -> Result<bool> {
    Ok(*constants::SUPPORTED_WINDOW_SYSTEM.get().unwrap())
}


/// Handles changes in the mpv wrapper's size and repositions the mpv window.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window instance.
/// - `wrapper_size`: The new size of the MPV wrapper.
///
/// # Returns
/// - `Result<()>`: An empty result on success or an error if the operation fails.
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


/// Repositions the mpv window to a smaller size and adjusts its position on the screen.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Reference to the Tauri window instance.
///
/// # Returns
/// - `Ok(())` on successful repositioning.
/// - `Err` if an error occurs during repositioning.
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
    let x = size.width as f64 / 2.0 + 384.0 * factor + offset;
    let w = size.width as f64 - x - 2.0 * offset;
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


/// Loads media from a source.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Reference to the Tauri window instance.
/// - `data`: JSON string containing source URL and JWT for playback.
///
/// # Returns
/// - `Ok(())` on successful loading.
/// - `Err` if an error occurs during loading.
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


/// Loads media from a given URL.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Reference to the Tauri window instance.
/// - `data`: JSON string containing the URL for playback.
///
/// # Returns
/// - `Ok(())` on successful loading.
/// - `Err` if an error occurs during loading.
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


/// Removes the current item from the playlist.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Reference to the Tauri window instance.
///
/// # Returns
/// - `Ok(())` on success.
/// - `Err` if an error occurs.
#[tauri::command]
pub async fn mpv_remove_current_from_playlist(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
    mpv_ipc_tx.send(Interface::PlaylistRemoveCurrent).await?;
    window.emit("mpv-reported-speed-change", None::<Decimal>)?;
    Ok(())
}


/// Retrieves loaded information about the current media, including audio and subtitle settings.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Reference to the Tauri window instance.
///
/// # Returns
/// - `Ok(UserLoadedInfo)` containing details about the loaded media.
/// - `Err` if an error occurs.
#[tauri::command]
pub async fn mpv_get_loaded_info(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<UserLoadedInfo> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let aid = ipc::get_aid(&ipc_data).await?;
    let sid = ipc::get_sid(&ipc_data).await?;
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


/// Sets the pause state of the player.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Reference to the Tauri window instance.
/// - `pause`: Boolean indicating whether to pause or resume playback.
///
/// # Returns
/// - `Ok(())` on success.
/// - `Err` if an error occurs.
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


/// Retrieves the current playback timestamp.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Reference to the Tauri window instance.
///
/// # Returns
/// - `Ok(f64)` containing the current timestamp in seconds.
/// - `Err` if an error occurs.
#[tauri::command]
pub async fn mpv_get_timestamp(state: tauri::State<'_, Arc<AppState>>, window: tauri::Window) -> Result<f64> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let time = ipc::get_timestamp(&ipc_data).await?;
    Ok(time)
}


/// Seeks to a specific timestamp in the media.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `timestamp`: The timestamp to seek to, in seconds.
///
/// # Returns
/// - `Ok(())` if the operation is successful.
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


/// Displays messages about user readiness states.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `loading`: List of users that are still loading.
/// - `not_ready`: List of users that are not ready.
///
/// # Returns
/// - `Ok(())` if the messages are displayed successfully.
#[tauri::command]
pub async fn mpv_show_ready_messages(
    state: tauri::State<'_, Arc<AppState>>,
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


/// Hides messages related to user readiness.
///
/// # Parameters
/// - `state`: Shared application state.
///
/// # Returns
/// - `Ok(())` if the messages are successfully hidden.
#[tauri::command]
pub async fn mpv_hide_ready_messages(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    mpv_ipc_tx.send(Interface::ShowNotReadyMsg(vec![])).await?;
    mpv_ipc_tx.send(Interface::ShowLoadingMsg(vec![])).await?;

    Ok(())
}


/// Displays a message in mpv.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `text`: The message text to display.
/// - `duration`: Duration for which the message should be displayed, in seconds.
/// - `mood`: Mood of the message (`Neutral`, `Good`, `Bad`, or `Warning`).
///
/// # Returns
/// - `Ok(())` if the message is displayed successfully.
#[tauri::command]
pub async fn mpv_show_msg(
    state: tauri::State<'_, Arc<AppState>>,
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


/// Sets the playback speed of mpv.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window instance.
/// - `speed`: Desired playback speed.
///
/// # Returns
/// - `Ok(())` if the speed is set successfully.
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


/// Retrieves the current audio track ID.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window for user interface.
///
/// # Returns
/// - `Ok(Some(u64))` if an audio track ID is retrieved.
/// - `Ok(None)` if no audio track is selected.
#[tauri::command]
pub async fn mpv_get_audio(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<Option<u64>> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let aid = ipc::get_aid(&ipc_data).await?;
    Ok(aid)
}


/// Sets the audio track by its ID.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `aid`: Optional ID of the audio track to set.
///
/// # Returns
/// - `Ok(())` if the audio track is set successfully.
#[tauri::command]
pub async fn mpv_set_audio(
    state: tauri::State<'_, Arc<AppState>>,
    aid: Option<u64>
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut mpv_ignore_next_audio_change_event_wl = state.mpv_ignore_next_audio_change_event.write().await;
    *mpv_ignore_next_audio_change_event_wl = true;
    mpv_ipc_tx.send(Interface::SetAudio(aid)).await?;
    Ok(())
}


/// Retrieves the current subtitle track ID.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window instance.
///
/// # Returns
/// - `Ok(Some(u64))` if a subtitle track ID is retrieved.
/// - `Ok(None)` if no subtitle track is selected.
#[tauri::command]
pub async fn mpv_get_sub(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<Option<u64>> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let sid = ipc::get_sid(&ipc_data).await?;
    Ok(sid)
}


/// Sets the subtitle track by its ID.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `sid`: Optional ID of the subtitle track to set.
///
/// # Returns
/// - `Ok(())` if the subtitle track is set successfully.
#[tauri::command]
pub async fn mpv_set_sub(
    state: tauri::State<'_, Arc<AppState>>,
    sid: Option<u64>
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut mpv_ignore_next_sub_change_event_wl = state.mpv_ignore_next_sub_change_event.write().await;
    *mpv_ignore_next_sub_change_event_wl = true;
    mpv_ipc_tx.send(Interface::SetSub(sid)).await?;
    Ok(())
}


/// Retrieves the current audio delay.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window instance.
///
/// # Returns
/// - `Ok(f64)` containing the audio delay in seconds.
#[tauri::command]
pub async fn mpv_get_audio_delay(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<f64> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let audio_delay = ipc::get_audio_delay(&ipc_data).await?;
    Ok(audio_delay)
}


/// Sets the audio delay.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `audio_delay`: Desired audio delay in seconds.
///
/// # Returns
/// - `Ok(())` if the audio delay is set successfully.
#[tauri::command]
pub async fn mpv_set_audio_delay(
    state: tauri::State<'_, Arc<AppState>>,
    audio_delay: f64
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut mpv_ignore_next_audio_delay_event_wl = state.mpv_ignore_next_audio_delay_event.write().await;
    *mpv_ignore_next_audio_delay_event_wl = true;
    mpv_ipc_tx.send(Interface::SetAudioDelay(audio_delay)).await?;
    Ok(())
}


/// Retrieves the current subtitle delay.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window instance.
///
/// # Returns
/// - `Ok(f64)` containing the subtitle delay in seconds.
#[tauri::command]
pub async fn mpv_get_sub_delay(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window
) -> Result<f64> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    let sub_delay = ipc::get_sub_delay(&ipc_data).await?;
    Ok(sub_delay)
}


/// Sets the subtitle delay.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `sub_delay`: Desired subtitle delay in seconds.
///
/// # Returns
/// - `Ok(())` if the subtitle delay is set successfully.
#[tauri::command]
pub async fn mpv_set_sub_delay(
    state: tauri::State<'_, Arc<AppState>>,
    sub_delay: f64
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut mpv_ignore_next_sub_delay_event_wl = state.mpv_ignore_next_sub_delay_event.write().await;
    *mpv_ignore_next_sub_delay_event_wl = true;
    mpv_ipc_tx.send(Interface::SetSubDelay(sub_delay)).await?;
    Ok(())
}


/// Clears all messages displayed in mpv.
///
/// # Parameters
/// - `state`: Shared application state.
///
/// # Returns
/// - `Ok(())` if all messages are successfully cleared.
#[tauri::command]
pub async fn mpv_clear_msgs(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<()> {
    let mpv_ipc_tx_rl = state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    mpv_ipc_tx.send(Interface::ClearMessages).await?;
    Ok(())
}


/// Increases the playback speed by a specified value.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window instance.
/// - `playback_speed_plus`: Amount by which to increase the speed.
///
/// # Returns
/// - `Ok(())` if the speed is increased successfully.
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


/// Decreases the playback speed by a specified value.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window instance.
/// - `playback_speed_minus`: Amount by which to decrease the speed.
///
/// # Returns
/// - `Ok(())` if the speed is decreased successfully.
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


/// Retrieves the current playback pause state.
///
/// # Parameters
/// - `state`: Shared application state.
/// - `window`: Tauri window for user interface.
///
/// # Returns
/// - `Ok(bool)` indicating whether playback is paused.
#[tauri::command]
pub async fn mpv_get_pause(
    state: tauri::State<'_, Arc<AppState>>,
    window: tauri::Window,
) -> Result<bool> {
    let ipc_data = IpcData { app_state: state.inner().clone(), window };
    Ok(ipc::get_pause(&ipc_data).await?)
}