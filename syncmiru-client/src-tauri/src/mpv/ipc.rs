//! This module handles IPC with the mpv.

#[cfg(target_family = "windows")]
pub mod win32;
mod utils;

use std::fmt::{Display, Formatter};
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;
use anyhow::{anyhow};
use cfg_if::cfg_if;
use interprocess::local_socket::{
    tokio::{prelude::*, Stream},
};
use interprocess::local_socket::tokio::{RecvHalf, SendHalf};
use rust_decimal::Decimal;
use rust_decimal::prelude::FromPrimitive;
use serde_repr::Deserialize_repr;
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::sync::mpsc::{Receiver};
use tokio::sync::{mpsc, oneshot};
use tokio::time::{sleep, Instant};
use crate::appstate::AppState;
use crate::{constants, mpv};
use crate::error::SyncmiruError;
use crate::result::Result;


/// Enum representing various commands that can be sent to the mpv process.
#[derive(Debug, PartialEq)]
pub enum Interface {
    /// Command to load a file from a URL with an authentication token
    LoadFromSource { source_url: String, jwt: String },

    /// Command to load a file from a URL
    LoadFromUrl(String),

    /// Command to set the playback pause state
    SetPause(bool),

    /// Command to seek to a specific timestamp in the media
    Seek(f64),

    /// Command to set the audio stream (None means no audio stream is selected)
    SetAudio(Option<u64>),

    /// Command to set the subtitle stream (None means no subtitle stream is selected)
    SetSub(Option<u64>),

    /// Command to set the fullscreen state of the mpv window
    SetFullscreen(bool),

    /// Command to set the playback speed
    SetPlaybackSpeed(Decimal),

    /// Command to set the audio delay
    SetAudioDelay(f64),

    /// Command to set the subtitle delay
    SetSubDelay(f64),

    /// Command to retrieve the audio stream ID
    GetAid(u32),

    /// Command to retrieve the subtitle stream ID
    GetSid(u32),

    /// Command to retrieve the fullscreen state
    GetFullscreen(u32),

    /// Command to retrieve the current timestamp position of mpv
    GetTimePos(u32),

    /// Command to retrieve the pause state of playback
    GetPause(u32),

    /// Command to retrieve the playback speed
    GetPlaybackSpeed(u32),

    /// Command to retrieve the audio delay
    GetAudioDelay(u32),

    /// Command to retrieve the subtitle delay
    GetSubDelay(u32),

    /// Command to show a "not ready" message with a list of names
    ShowNotReadyMsg(Vec<String>),

    /// Command to show a "loading" message with a list of names
    ShowLoadingMsg(Vec<String>),

    /// Command to show a message with a specific ID, text, duration, and mood
    ShowMsg { id: u32, text: String, duration: f64, mood: MsgMood },

    /// Command to delete a message with a specific ID
    DeleteMsg(u32),

    /// Command to clear all messages
    ClearMessages,

    /// Command to remove the current item from the playlist.
    PlaylistRemoveCurrent,

    /// Command to exit the mpv IPC.
    Exit
}


/// Enum representing the different properties that can be retrieved from the mpv process.
#[derive(Debug, PartialEq)]
enum Property {
    Aid,
    Sid,
    TimePos,
    Fullscreen,
    Pause,
    PlaybackSpeed,
    AudioDelay,
    SubDelay
}


/// Enum representing the possible moods for messages displayed in mpv.
#[derive(Debug, PartialEq, Deserialize_repr)]
#[repr(u8)]
pub enum MsgMood {
    /// Neutral mood (blue)
    Neutral = 0,

    /// Bad mood (red)
    Bad = 1,

    /// Good mood (green)
    Good = 2,

    /// Warning mood (yellow)
    Warning = 3
}

impl Display for MsgMood {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            MsgMood::Neutral => write!(f, "{}", MsgMood::Neutral as u32),
            MsgMood::Bad => write!(f, "{}", MsgMood::Bad as u32),
            MsgMood::Good => write!(f, "{}", MsgMood::Good as u32),
            MsgMood::Warning => write!(f, "{}", MsgMood::Warning as u32)
        }
    }
}

/// A struct that encapsulates the data necessary for IPC communication, including
/// access to the application state and the window instance for emitting events.
///
/// Fields:
/// - `window`: The `tauri::Window` that is used to communicate with the frontend.
/// - `app_state`: A reference to the shared application state (`AppState`), used for accessing player-specific data like MPV's current properties.
pub struct IpcData {
    pub window: tauri::Window,
    pub app_state: Arc<AppState>,
}


/// Starts the IPC communication by establishing a connection to the MPV player via a named pipe.
/// It listens for mpv's responses and writes commands based on the data received from the `mpv_write_rx` receiver.
///
/// Arguments:
/// - `mpv_write_rx`: A receiver that provides commands (`Interface` enum) to be sent to MPV.
/// - `pipe_id`: The ID of the pipe used to communicate with MPV.
/// - `window`: The `tauri::Window` instance used to emit events to the frontend.
/// - `app_state`: A reference to the shared `AppState` that stores the application's state.
///
/// Returns:
/// - `Result<()>`: A `Result` that indicates whether the operation was successful or failed with an error.
pub async fn start(
    mpv_write_rx: Receiver<Interface>,
    pipe_id: String,
    window: tauri::Window,
    app_state: Arc<AppState>,
) -> Result<()> {
    let pipe_name = utils::get_pipe_name(&pipe_id)?;

    let conn = Stream::connect(pipe_name).await?;
    let (recv, sender) = conn.split();

    let (exit_tx, exit_rx) = oneshot::channel();
    let exit_tx_opt = Some(exit_tx);

    let ipc_data = IpcData { app_state, window };

    let listen_task = listen(recv, &ipc_data, exit_rx);
    let write_task = write(mpv_write_rx, sender, &ipc_data, exit_tx_opt);

    tokio::try_join!(listen_task, write_task)?;
    Ok(())
}


/// Retrieves the audio stream ID (aid) from mpv.
///
/// Arguments:
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
///
/// Returns:
/// - `Result<Option<u64>>`: The result contains the `aid` if available, or `None` if no audio stream is set, or an error if the operation fails.
pub async fn get_aid(ipc_data: &IpcData) -> Result<Option<u64>> {
    let mut rx = send_with_response(ipc_data, Property::Aid).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(_) = data.as_bool() {
                return Ok(None)
            }
            if let Some(aid) = data.as_u64() {
                return Ok(Some(aid))
            }
        }
    }
    Err(SyncmiruError::MpvReceiveResponseError)
}


/// Retrieves the subtitle stream ID (sid) from mpv.
///
/// Arguments:
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
///
/// Returns:
/// - `Result<Option<u64>>`: The result contains the `sid` if available, or `None` if no subtitle stream is set, or an error if the operation fails.
pub async fn get_sid(ipc_data: &IpcData) -> Result<Option<u64>> {
    let mut rx = send_with_response(ipc_data, Property::Sid).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(_) = data.as_bool() {
                return Ok(None)
            }
            if let Some(sid) = data.as_u64() {
                return Ok(Some(sid))
            }
        }
    }
    Err(SyncmiruError::MpvReceiveResponseError)
}


/// Retrieves the audio delay setting from mpv.
///
/// Arguments:
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
///
/// Returns:
/// - `Result<f64>`: The result contains the audio delay in seconds, or an error if the operation fails.
pub async fn get_audio_delay(ipc_data: &IpcData) -> Result<f64> {
    let mut rx = send_with_response(ipc_data, Property::AudioDelay).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(audio_delay) = data.as_f64() {
                return Ok(audio_delay)
            }
        }
    }
    Err(SyncmiruError::MpvReceiveResponseError)
}


/// Retrieves the subtitle delay setting from mpv.
///
/// Arguments:
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
///
/// Returns:
/// - `Result<f64>`: The result contains the subtitle delay in seconds, or an error if the operation fails.
pub async fn get_sub_delay(ipc_data: &IpcData) -> Result<f64> {
    let mut rx = send_with_response(ipc_data, Property::SubDelay).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(sub_delay) = data.as_f64() {
                return Ok(sub_delay)
            }
        }
    }
    Err(SyncmiruError::MpvReceiveResponseError)
}


/// Retrieves the current timestamp (time position) of mpv.
///
/// Arguments:
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
///
/// Returns:
/// - `Result<f64>`: The result contains the current time position in seconds, or an error if the operation fails.
pub async fn get_timestamp(ipc_data: &IpcData) -> Result<f64> {
    let mut rx = send_with_response(ipc_data, Property::TimePos).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(timepos) = data.as_f64() {
                return Ok(timepos)
            }
        }
    }
    Err(SyncmiruError::MpvReceiveResponseError)
}


/// Retrieves the current pause state of mpv (whether playback is paused).
///
/// Arguments:
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
///
/// Returns:
/// - `Result<bool>`: The result contains `true` if the player is paused, or `false` if it is playing, or an error if the operation fails.
pub async fn get_pause(ipc_data: &IpcData) -> Result<bool> {
    let mut rx = send_with_response(ipc_data, Property::Pause).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(pause) = data.as_bool() {
                return Ok(pause)
            }
        }
    }
    Err(SyncmiruError::MpvReceiveResponseError)
}


/// Retrieves the playback speed from mpv.
///
/// Arguments:
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
///
/// Returns:
/// - `Result<Decimal>`: The result contains the playback speed as a `Decimal`, or an error if the operation fails.
pub async fn get_speed(ipc_data: &IpcData) -> Result<Decimal> {
    let mut rx = send_with_response(ipc_data, Property::PlaybackSpeed).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(speed_num) = data.as_number() {
                if let Ok(speed) = Decimal::from_str(&speed_num.to_string()) {
                    return Ok(speed)
                }
            }
        }
    }
    Err(SyncmiruError::MpvReceiveResponseError)
}


/// Sends a request to mpv to retrieve a specific property and waits for a response.
///
/// Arguments:
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
/// - `property`: The specific property (`Property` enum) to retrieve from mpv.
///
/// Returns:
/// - `Result<Receiver<serde_json::Value>>`: The result contains a receiver that provides the response from MPV.
async fn send_with_response(ipc_data: &IpcData, property: Property) -> Result<Receiver<serde_json::Value>> {
    let req_id = ipc_data.app_state.get_mpv_next_req_id().await;

    let mpv_ipc_tx_rl = ipc_data.app_state.mpv_ipc_tx.read().await;
    if let Some(mpv_ipc_tx) = mpv_ipc_tx_rl.as_ref() {
        let mut mpv_response_senders_wl = ipc_data.app_state.mpv_response_senders.write().await;
        let (tx, rx) = mpsc::channel::<serde_json::Value>(1);
        mpv_response_senders_wl.insert(req_id, tx);

        match property {
            Property::Aid => { mpv_ipc_tx.send(Interface::GetAid(req_id)).await? }
            Property::Sid => { mpv_ipc_tx.send(Interface::GetSid(req_id)).await? }
            Property::TimePos => { mpv_ipc_tx.send(Interface::GetTimePos(req_id)).await? }
            Property::Fullscreen => { mpv_ipc_tx.send(Interface::GetFullscreen(req_id)).await? }
            Property::Pause => { mpv_ipc_tx.send(Interface::GetPause(req_id)).await? },
            Property::PlaybackSpeed => { mpv_ipc_tx.send(Interface::GetPlaybackSpeed(req_id)).await? },
            Property::AudioDelay => { mpv_ipc_tx.send(Interface::GetAudioDelay(req_id)).await? },
            Property::SubDelay => { mpv_ipc_tx.send(Interface::GetSubDelay(req_id)).await? }
        }
        Ok(rx)
    }
    else {
        Err(SyncmiruError::MpvReceiveResponseError)
    }
}


/// Listens for responses from mpv and processes them asynchronously.
///
/// Arguments:
/// - `recv`: The receiving half of the socket stream to read responses from mpv.
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
/// - `exit_rx`: A receiver for the exit signal to stop the listening task.
///
/// Returns:
/// - `Result<()>`: A `Result` indicating whether the operation was successful or failed with an error.
async fn listen(
    recv: RecvHalf,
    ipc_data: &IpcData,
    mut exit_rx: oneshot::Receiver<()>,
) -> Result<()> {
    let mut reader = BufReader::new(recv);
    let mut buffer = String::with_capacity(1024);
    loop {
        tokio::select! {
            read_bytes = reader.read_line(&mut buffer) => {
                match read_bytes {
                     Ok(0) => {
                        break;
                     },
                     Ok(_) => {
                        process_mpv_msg(&buffer, ipc_data).await?;
                        buffer.clear();
                     },
                     Err(e) => {
                        break;
                     }
                }
            }
            _ = &mut exit_rx => {
                break;
            }
        }
    }
    Ok(())
}


/// Writes commands to the mpv based on incoming messages from the `mpv_write_rx` receiver.
///
/// Arguments:
/// - `rx`: A receiver that provides commands (`Interface` enum) to be sent to mpv.
/// - `sender`: The sending half of the socket stream to send commands to mpv.
/// - `ipc_data`: A reference to the `IpcData` struct, which contains the application state and window.
/// - `exit_tx_opt`: An optional sender for the exit signal to stop the writing task.
///
/// Returns:
/// - `Result<()>`: A `Result` indicating whether the operation was successful or failed with an error.
async fn write(
    mut rx: Receiver<Interface>,
    mut sender: SendHalf,
    ipc_data: &IpcData,
    mut exit_tx_opt: Option<oneshot::Sender<()>>,
) -> Result<()> {
    init_observe_property(&sender).await?;
    loop {
        let msg_opt = rx.recv().await;
        if let Some(msg) = msg_opt {
            match msg {
                Interface::LoadFromSource {ref source_url, ref jwt } => {
                    let cmd = format!(
                        "{{\"command\":  [\"loadfile\", \"{}\", \"replace\", -1, {{\"start\": \"0\", \"http-header-fields\": \"Authorization: Bearer {}\"}}]}}\n",
                        source_url,
                        jwt
                    );
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::LoadFromUrl(ref url) => {
                    let cmd = format!("{{\"command\":  [\"loadfile\", \"{}\", \"replace\"]}}\n",
                        url
                    );
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::SetPause(p) => {
                    let cmd = utils::create_set_property_cmd("pause", &p);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::Seek(timestamp) => {
                    let cmd = utils::create_set_property_cmd("time-pos", &timestamp);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::SetAudio(aid_opt) => {
                    if let Some(aid) = aid_opt {
                        let cmd = utils::create_set_property_cmd("aid", &aid);
                        sender.write_all(cmd.as_bytes()).await?;
                    }
                    else {
                        let cmd = utils::create_set_property_cmd("aid", &false);
                        sender.write_all(cmd.as_bytes()).await?;
                    }
                },
                Interface::SetSub(sid_opt) => {
                    if let Some(sid) = sid_opt {
                        let cmd = utils::create_set_property_cmd("sid", &sid);
                        sender.write_all(cmd.as_bytes()).await?;
                    }
                    else {
                        let cmd = utils::create_set_property_cmd("sid", &false);
                        sender.write_all(cmd.as_bytes()).await?;
                    }
                },
                Interface::SetFullscreen(state) => {
                    let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
                    let cmd = format!("{{\"command\": [\"set\", \"fullscreen\", \"{}\"]}}\n", utils::bool2_yn(state));
                    sender.write_all(cmd.as_bytes()).await?;

                    mpv::window::focus(&ipc_data.app_state, mpv_wid_rl.unwrap()).await?;
                },
                Interface::SetPlaybackSpeed(ref playback_speed) => {
                    let cmd = utils::create_set_property_cmd("speed", playback_speed);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::SetAudioDelay(audio_delay) => {
                    let cmd = utils::create_set_property_cmd("audio-delay", &audio_delay);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::SetSubDelay(sub_delay) => {
                    let cmd = utils::create_set_property_cmd("sub-delay", &sub_delay);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetAid(req_id) => {
                    let cmd = utils::create_get_property_cmd("aid", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetSid(req_id) => {
                    let cmd = utils::create_get_property_cmd("sid", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetFullscreen(req_id) => {
                    let cmd = utils::create_get_property_cmd("fullscreen", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetTimePos(req_id) => {
                    let cmd = utils::create_get_property_cmd("time-pos", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetPause(req_id) => {
                    let cmd = utils::create_get_property_cmd("pause", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetPlaybackSpeed(req_id) => {
                    let cmd = utils::create_get_property_cmd("speed", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetAudioDelay(req_id) => {
                    let cmd = utils::create_get_property_cmd("audio-delay", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetSubDelay(req_id) => {
                    let cmd = utils::create_get_property_cmd("sub-delay", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::ShowNotReadyMsg(ref names) => {
                    let mut mpv_not_ready_msg_id_wl = ipc_data.app_state.mpv_not_ready_msg_id.write().await;
                    if names.is_empty() {
                        if let Some(msg_id) = *mpv_not_ready_msg_id_wl {
                            let cmd = format!(
                                "{{\"command\": [\"script-message-to\", \"prelude\", \"msg-del\", \"{}\"]}}\n", msg_id);
                            sender.write_all(cmd.as_bytes()).await?;
                            *mpv_not_ready_msg_id_wl = None;
                        }
                    }
                    else {
                        let text = format!("{} {}", t!("mpv-not-ready-msg"), names.join(", "));
                        if mpv_not_ready_msg_id_wl.is_none() {
                            let msg_id = ipc_data.app_state.get_mpv_next_req_id().await;
                            let cmd = format!(
                                "{{\"command\": [\"script-message-to\", \"prelude\", \"msg-add\", \"{}\", \"{}\", \"0\", \"{}\"]}}\n",
                                text,
                                msg_id,
                                MsgMood::Bad
                            );
                            sender.write_all(cmd.as_bytes()).await?;
                            *mpv_not_ready_msg_id_wl = Some(msg_id);
                        }
                        else {
                            let msg_id = mpv_not_ready_msg_id_wl.unwrap();
                            let cmd = format!(
                                "{{\"command\": [\"script-message-to\", \"prelude\", \"msg-edit\", \"{}\", \"{}\"]}}\n",
                                msg_id,
                                text,
                            );
                            sender.write_all(cmd.as_bytes()).await?;
                        }
                    }
                },
                Interface::ShowLoadingMsg(ref names) => {
                    let mut mpv_loading_msg_id_wl = ipc_data.app_state.mpv_loading_msg_id.write().await;
                    if names.is_empty() {
                        if let Some(msg_id) = *mpv_loading_msg_id_wl {
                            let cmd = format!(
                                "{{\"command\": [\"script-message-to\", \"prelude\", \"msg-del\", \"{}\"]}}\n", msg_id);
                            sender.write_all(cmd.as_bytes()).await?;
                            *mpv_loading_msg_id_wl = None;
                        }
                    }
                    else {
                        let text = format!("{} {}", t!("mpv-loading-msg"), names.join(", "));
                        if mpv_loading_msg_id_wl.is_none() {
                            let msg_id = ipc_data.app_state.get_mpv_next_req_id().await;
                            let cmd = format!(
                                "{{\"command\": [\"script-message-to\", \"prelude\", \"msg-add\", \"{}\", \"{}\", \"0\", \"{}\"]}}\n",
                                text,
                                msg_id,
                                MsgMood::Warning
                            );
                            sender.write_all(cmd.as_bytes()).await?;
                            *mpv_loading_msg_id_wl = Some(msg_id);
                        }
                        else {
                            let msg_id = mpv_loading_msg_id_wl.unwrap();
                            let cmd = format!(
                                "{{\"command\": [\"script-message-to\", \"prelude\", \"msg-edit\", \"{}\", \"{}\"]}}\n",
                                msg_id,
                                text,
                            );
                            sender.write_all(cmd.as_bytes()).await?;
                        }
                    }
                },
                Interface::ClearMessages => {
                    let mut mpv_not_ready_msg_id_wl = ipc_data.app_state.mpv_not_ready_msg_id.write().await;
                    let mut mpv_loading_msg_id_wl = ipc_data.app_state.mpv_loading_msg_id.write().await;
                    let mut mpv_everyone_ready_msg_id_wl = ipc_data.app_state.mpv_everyone_ready_msg_id.write().await;
                    let mut mpv_neutral_msgs_wl = ipc_data.app_state.mpv_neutral_msgs.write().await;
                    *mpv_not_ready_msg_id_wl = None;
                    *mpv_loading_msg_id_wl = None;
                    *mpv_everyone_ready_msg_id_wl = None;
                    *mpv_neutral_msgs_wl = Vec::new();
                    sender.write_all(b"{\"command\": [\"script-message-to\", \"prelude\", \"msgs-clear\"]}\n").await?;

                },
                Interface::ShowMsg { id, text, duration, mood } => {
                    let cmd = format!(
                        "{{\"command\": [\"script-message-to\", \"prelude\", \"msg-add\", \"{}\", \"{}\", \"{}\", \"{}\"]}}\n",
                        text,
                        id,
                        duration,
                        mood
                    );
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::DeleteMsg(id) => {
                    let cmd = format!("{{\"command\": [\"script-message-to\", \"prelude\", \"msg-del\", \"{}\"]}}\n", id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::PlaylistRemoveCurrent => {
                    sender.write_all(b"{\"command\": [\"playlist_remove\", \"current\"]}\n").await?;
                    cfg_if! {
                        if #[cfg(target_family = "windows")] {
                            let appdata = ipc_data.app_state.appdata.read().await;
                            if !appdata.mpv_win_detached {
                                let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
                                sleep(Duration::from_millis(50)).await;
                                mpv::window::win32::hide_borders(&ipc_data.app_state, mpv_wid_rl.unwrap()).await?;
                            }
                        }
                        else {
                            ipc_data.window.emit("mpv-resize", {})?;
                        }
                    }
                },
                Interface::Exit => {
                    exit_tx_opt
                        .take()
                        .unwrap()
                        .send(())
                        .map_err(|_| anyhow!("killing interprocess mpv communication failed"))?;
                }
            }
        } else {
            break;
        }
    }
    Ok(())
}


/// Initializes observing various mpv properties like audio, subtitle tracks, pause state, etc.
/// This function sends multiple observe property commands to the mpv process for continuous observation.
///
/// # Parameters:
/// - `sender`: A reference to the sending half of the channel for communication with MPV.
///
/// # Returns:
/// - `Result<()>`: A `Result` indicating whether the operation was successful or not.
async fn init_observe_property(sender: &SendHalf) -> Result<()> {
    let properties = vec!["aid", "sid", "pause", "fullscreen", "speed", "audio-delay", "sub-delay"];
    for (i, property) in properties.iter().enumerate() {
        observe_property(sender, i, property).await?;
    }
    Ok(())
}


/// Sends a command to the mpv process to observe a specific property.
///
/// # Parameters:
/// - `sender`: A mutable reference to the sending half of the channel for communication with mpv.
/// - `id`: An identifier for the property being observed.
/// - `name`: The name of the property to observe.
///
/// # Returns:
/// - `Result<()>`: A `Result` indicating whether the operation was successful or not.
async fn observe_property(
    mut sender: &SendHalf,
    id: usize,
    name: &str,
) -> Result<()> {
    let cmd = format!("{{\"command\": [\"observe_property\", {}, \"{}\"] }}\n", id, name);
    sender.write_all(cmd.as_bytes()).await?;
    Ok(())
}


/// Processes incoming mpv messages and handles different event types (such as property changes, file loads, etc.).
/// It parses the JSON message and dispatches it to appropriate handlers for each event type.
///
/// # Parameters:
/// - `msg`: The incoming message string from mpv.
/// - `ipc_data`: A reference to the shared application state and communication channels.
///
/// # Returns:
/// - `Result<()>`: A `Result` indicating whether the operation was successful or not.
async fn process_mpv_msg(msg: &str, ipc_data: &IpcData) -> Result<()> {
    let json: serde_json::Value = serde_json::from_str(msg)?;
    if let Some(event) = json.get("event") {
        if let Some(event_msg) = event.as_str() {
            match event_msg {
                "property-change" => { process_property_changed(&json, ipc_data).await? }
                "client-message" => { process_client_msg(&json, ipc_data).await? }
                "file-loaded" => { process_file_loaded(ipc_data); }
                "playback-restart" => { process_playback_restart(ipc_data)?; }
                "end-file" => { process_end_file(&json, ipc_data)?; }
                "idle" => { process_idle_msg(ipc_data)?; },
                "seek" => { process_seek_msg(ipc_data).await?; }
                _ => {}
            }
        }
    }
    if let Some(request_id) = json.get("request_id") {
        if let Some(req_id) = request_id.as_u64().and_then(|x| Some(x as u32)) {
            let mpv_response_senders_wl = ipc_data.app_state.mpv_response_senders.read().await;
            if let Some(tx) = mpv_response_senders_wl.get(&req_id) {
                tx.send(json).await?;
            }
        }
    }
    Ok(())
}


/// Processes a property-change event from mpv and triggers the appropriate actions based on the changed property.
///
/// # Parameters:
/// - `msg`: The parsed JSON message containing the property-change event.
/// - `ipc_data`: A reference to the shared application state and communication channels.
///
/// # Returns:
/// - `Result<()>`: A `Result` indicating whether the operation was successful or not.
async fn process_property_changed(msg: &serde_json::Value, ipc_data: &IpcData) -> Result<()> {
    if let Some(name_value) = msg.get("name") {
        if let Some(name) = name_value.as_str() {
            if name == "fullscreen" {
                let fullscreen_state = msg.get("data").unwrap().as_bool().unwrap();
                fullscreen_changed(fullscreen_state, ipc_data).await?;
            }
            else if name == "pause" {
                let pause_state = msg.get("data").unwrap().as_bool().unwrap();
                if pause_state {
                    let mut mpv_ignore_next_pause_true_event_wl =  ipc_data.app_state.mpv_ignore_next_pause_true_event.write().await;
                    if *mpv_ignore_next_pause_true_event_wl {
                        *mpv_ignore_next_pause_true_event_wl = false;
                        return Ok(())
                    }
                }
                else {
                    let mut mpv_ignore_next_pause_false_event_wl = ipc_data.app_state.mpv_ignore_next_pause_false_event.write().await;
                    if *mpv_ignore_next_pause_false_event_wl {
                        *mpv_ignore_next_pause_false_event_wl = false;
                        return Ok(())
                    }
                }
                pause_changed(pause_state, ipc_data);
            }
            else if name == "speed" {
                let speed = Decimal::from_f64(msg.get("data").unwrap().as_f64().unwrap()).unwrap();
                let mut mpv_ignore_next_speed_event_wl = ipc_data.app_state.mpv_ignore_next_speed_event.write().await;
                if *mpv_ignore_next_speed_event_wl {
                    *mpv_ignore_next_speed_event_wl = false;
                    return Ok(())
                }
                speed_changed(&speed, ipc_data);
            }
            else if name == "aid" {
                let data = msg.get("data").unwrap();
                if data.as_str().is_some() {
                   return Ok(())
                }

                let mut mpv_ignore_next_audio_change_event_wl = ipc_data.app_state.mpv_ignore_next_audio_change_event.write().await;
                if *mpv_ignore_next_audio_change_event_wl {
                    *mpv_ignore_next_audio_change_event_wl = false;
                    return Ok(())
                }

                if let Some(aid) = data.as_u64() {
                    audio_track_changed(Some(aid), ipc_data);
                }
                else {
                    audio_track_changed(None, ipc_data);
                }
            }
            else if name == "sid" {
                let data = msg.get("data").unwrap();
                if data.as_str().is_some() {
                    return Ok(())
                }

                let mut mpv_ignore_next_sub_change_event_wl = ipc_data.app_state.mpv_ignore_next_sub_change_event.write().await;
                if *mpv_ignore_next_sub_change_event_wl {
                    *mpv_ignore_next_sub_change_event_wl = false;
                    return Ok(())
                }

                if let Some(sid) = data.as_u64() {
                    sub_track_changed(Some(sid), ipc_data);
                }
                else {
                    sub_track_changed(None, ipc_data);
                }
            }
            else if name == "sub-delay" {
                let sub_delay = msg.get("data").unwrap().as_f64().unwrap();
                let mut mpv_ignore_next_sub_delay_event_wl = ipc_data.app_state.mpv_ignore_next_sub_delay_event.write().await;
                if *mpv_ignore_next_sub_delay_event_wl {
                    *mpv_ignore_next_sub_delay_event_wl = false;
                    return Ok(())
                }
                sub_delay_changed(sub_delay, ipc_data);
            }
            else if name == "audio-delay" {
                let audio_delay = msg.get("data").unwrap().as_f64().unwrap();
                let mut mpv_ignore_next_audio_delay_event_wl = ipc_data.app_state.mpv_ignore_next_audio_delay_event.write().await;
                if *mpv_ignore_next_audio_delay_event_wl {
                    *mpv_ignore_next_audio_delay_event_wl = false;
                    return Ok(())
                }
                audio_delay_changed(audio_delay, ipc_data);
            }
        }
    }
    Ok(())
}


/// Handles changes in the fullscreen state and updates the application's window accordingly.
/// It ensures that fullscreen events are debounced to prevent excessive updates.
///
/// # Parameters:
/// - `fullscreen_state`: The new fullscreen state (true for fullscreen, false for windowed).
/// - `ipc_data`: A reference to the shared application state and communication channels.
///
/// # Returns:
/// - `Result<()>`: A `Result` indicating whether the operation was successful or not.
async fn fullscreen_changed(fullscreen_state: bool, ipc_data: &IpcData) -> Result<()> {
    if !constants::SUPPORTED_WINDOW_SYSTEM.get().unwrap() {
        return Ok(())
    }

    {
        let mut mpv_ignore_fullscreen_events_timestamp_rl = ipc_data.app_state.mpv_ignore_fullscreen_events_timestamp.write().await;
        let now = Instant::now();
        if let Some(duration) = now.checked_duration_since(*mpv_ignore_fullscreen_events_timestamp_rl) {
            if duration.as_millis() < constants::MPV_IGNORE_FULLSCREEN_MILLIS {
                return Ok(())
            }
            else {
                *mpv_ignore_fullscreen_events_timestamp_rl = now;
            }
        }
    }
    if fullscreen_state {
        let mut appdata_wl = ipc_data.app_state.appdata.write().await;
        let mpv_win_detached = appdata_wl.mpv_win_detached;
        if !mpv_win_detached {
            let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
            let mpv_wid = mpv_wid_rl.unwrap();

            mpv::window::detach(&ipc_data.app_state, mpv_wid).await?;

            cfg_if! {
                if #[cfg(target_family = "windows")] {
                    let mpv_ipc_tx_rl = ipc_data.app_state.mpv_ipc_tx.read().await;
                    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
                    mpv_ipc_tx.send(Interface::SetFullscreen(false)).await?;
                    sleep(Duration::from_millis(70)).await;
                    mpv_ipc_tx.send(Interface::SetFullscreen(true)).await?;
                }
                else {
                    sleep(Duration::from_millis(70)).await;
                    let mpv_ipc_tx_rl = ipc_data.app_state.mpv_ipc_tx.read().await;
                    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
                    mpv_ipc_tx.send(Interface::SetFullscreen(true)).await?;
                }
            }

            appdata_wl.mpv_win_detached = true;

            let mut mpv_reattach_on_fullscreen_false_wl = ipc_data.app_state.mpv_reattach_on_fullscreen_false.write().await;
            *mpv_reattach_on_fullscreen_false_wl = true;

            ipc_data.window.emit("mpv-win-detached-changed", true).ok();
        }
    } else {
        let mut mpv_reattach_on_fullscreen_false_wl = ipc_data.app_state.mpv_reattach_on_fullscreen_false.write().await;
        if *mpv_reattach_on_fullscreen_false_wl {
            *mpv_reattach_on_fullscreen_false_wl = false;
            drop(mpv_reattach_on_fullscreen_false_wl);

            let mut appdata_wl = ipc_data.app_state.appdata.write().await;
            let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
            let mpv_wid = mpv_wid_rl.unwrap();

            cfg_if! {
                if #[cfg(target_family = "windows")] {
                    sleep(Duration::from_millis(50)).await;
                }
            }
            mpv::window::attach(&ipc_data.app_state, &ipc_data.window, mpv_wid).await?;
            cfg_if! {
                if #[cfg(target_family = "unix")] {
                    sleep(Duration::from_millis(50)).await;
                    mpv::window::focus(&ipc_data.app_state, mpv_wid).await?;
                }
            }
            appdata_wl.mpv_win_detached = false;
            ipc_data.window.emit("mpv-win-detached-changed", false).ok();
        }
    }
    Ok(())
}


/// Processes the incoming client message and performs actions based on specific commands.
///
/// # Parameters
/// - `msg`: The message received in JSON format from the mpv.
/// - `ipc_data`: An instance of `IpcData` that holds shared application state and resources.
///
/// # Returns
/// - `Result<()>`: A `Result` indicating whether the client message was successfully processed or not.
async fn process_client_msg(msg: &serde_json::Value, ipc_data: &IpcData) -> Result<()> {
    if !constants::SUPPORTED_WINDOW_SYSTEM.get().unwrap() {
        return Ok(())
    }

    if let Some(args_value) = msg.get("args") {
        if let Some(args) = args_value.as_array() {
            let cmd = args.get(0).unwrap().as_str().unwrap();
            if cmd == "mouse-enter" {
                cfg_if! {
                    if #[cfg(target_family = "unix")] {
                        let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
                        let mpv_wid = mpv_wid_rl.unwrap();
                        mpv::window::x11::set_default_cursor(&ipc_data.app_state, mpv_wid).await?;
                        sleep(Duration::from_millis(50)).await;
                        mpv::window::x11::set_default_cursor(&ipc_data.app_state, mpv_wid).await?;
                    }
                }
            }
            else if cmd == "mouse-btn-click" {
                let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
                mpv::window::focus(&ipc_data.app_state, mpv_wid_rl.unwrap()).await?;
            }
        }
    }
    Ok(())
}


/// Handles the event when a file is loaded in mpv.
///
/// # Parameters
/// - `ipc_data`: An instance of `IpcData` for interacting with the application's state.
fn process_file_loaded(ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-file-loaded", {}).ok();
}


/// Processes a playback restart event.
///
/// # Parameters
/// - `ipc_data`: An instance of `IpcData`.
///
/// # Returns
/// A `Result<()>` indicating success or failure.
fn process_playback_restart(ipc_data: &IpcData) -> Result<()> {
    cfg_if! {
        if #[cfg(target_family = "unix")] {
            ipc_data.window.emit("mpv-resize", {})?;
        }
    }
    Ok(())
}


/// Handles the `end-file` event from mpv.
///
/// # Parameters
/// - `msg`: A JSON object containing the reason for the file's end.
/// - `ipc_data`: An instance of `IpcData`.
///
/// # Returns
/// A `Result<()>` indicating success or failure.
fn process_end_file(msg: &serde_json::Value, ipc_data: &IpcData) -> Result<()> {
    if let Some(reason_v) = msg.get("reason") {
        let reason = reason_v.as_str().unwrap();
        if reason == "error" {
            ipc_data.window.emit("mpv-file-load-failed", {}).ok();
        }
    }
    Ok(())
}


/// Processes an idle message from mpv and performs necessary actions.
///
/// # Parameters
/// - `ipc_data`: An instance of `IpcData`.
///
/// # Returns
/// A `Result<()>` indicating success or failure.
fn process_idle_msg(ipc_data: &IpcData) -> Result<()> {
    cfg_if! {
        if #[cfg(target_family = "unix")] {
            ipc_data.window.emit("mpv-resize", {})?;
        }
    }
    Ok(())
}


/// Handles changes in the playback pause state.
///
/// # Parameters
/// - `pause_state`: The new pause state (true for paused, false for playing).
/// - `ipc_data`: An instance of `IpcData` for interacting with the application's state.
fn pause_changed(pause_state: bool, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-pause-changed", pause_state).ok();
}


/// Processes a seek message from mpv and triggers a seek event.
///
/// # Parameters
/// - `ipc_data`: An instance of `IpcData`.
///
/// # Returns
/// A `Result<()>` indicating success or failure.
async fn process_seek_msg(ipc_data: &IpcData) -> Result<()> {
    let mut mpv_ignore_next_seek_event_wl = ipc_data.app_state.mpv_ignore_next_seek_event.write().await;
    if *mpv_ignore_next_seek_event_wl {
        *mpv_ignore_next_seek_event_wl = false;
        return Ok(())
    }

    ipc_data.window.emit("mpv-seek", {}).ok();
    Ok(())
}


/// Handles changes in the playback speed.
///
/// # Parameters
/// - `speed`: The new playback speed as a `Decimal` value.
/// - `ipc_data`: An instance of `IpcData` for interacting with the application's state.
fn speed_changed(speed: &Decimal, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-speed-changed", speed).ok();
}


/// Handles changes in the subtitle delay.
///
/// # Parameters
/// - `sub_delay`: The new subtitle delay in seconds.
/// - `ipc_data`: An instance of `IpcData` for interacting with the application's state.
fn sub_delay_changed(sub_delay: f64, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-sub-delay-changed", sub_delay).ok();
}


/// Handles changes in the audio delay.
///
/// # Parameters
/// - `audio_delay`: The new audio delay in seconds.
/// - `ipc_data`: An instance of `IpcData` for interacting with the application's state.
fn audio_delay_changed(audio_delay: f64, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-audio-delay-changed", audio_delay).ok();
}


/// Handles changes in the audio track.
///
/// # Parameters
/// - `aid`: The audio track ID or `None` if the audio track is disabled.
/// - `ipc_data`: An instance of `IpcData` for interacting with the application's state.
fn audio_track_changed(aid: Option<u64>, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-audio-changed", aid).ok();
}


/// Handles changes in the subtitle track.
///
/// # Parameters
/// - `sid`: The subtitle track ID or `None` if the subtitle track is disabled.
/// - `ipc_data`: An instance of `IpcData` for interacting with the application's state.
fn sub_track_changed(sid: Option<u64>, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-sub-changed", sid).ok();
}