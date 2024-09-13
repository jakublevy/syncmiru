#[cfg(target_family = "windows")]
pub mod win32;
mod utils;

use std::fmt::{Display, Formatter};
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;
use anyhow::{anyhow, Context};
use cfg_if::cfg_if;
use interprocess::local_socket::{
    tokio::{prelude::*, Stream},
};
use interprocess::local_socket::tokio::{RecvHalf, SendHalf};
use rust_decimal::Decimal;
use rust_decimal::prelude::FromPrimitive;
use serde_repr::Deserialize_repr;
use tauri::Emitter;
use thiserror::__private::AsDisplay;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::sync::mpsc::{Receiver};
use tokio::sync::{mpsc, oneshot};
use tokio::time::{sleep, Instant};
use crate::appstate::AppState;
use crate::{constants, mpv};
use crate::error::SyncmiruError;
use crate::result::Result;

#[cfg(target_family = "unix")]
use crate::mpv::Interface::SetFullscreen;

#[derive(Debug, PartialEq)]
pub enum Interface {
    LoadFromSource { source_url: String, jwt: String },
    LoadFromUrl(String),
    SetPause(bool),
    Seek(f64),
    SetAudio(u64),
    SetSubs(u64),
    SetWindowSize { w: u32, h: u32 },
    SetFullscreen(bool),
    SetPlaybackSpeed(Decimal),
    SetAudioDelay(f64),
    SetSubDelay(f64),
    GetAid(u32),
    GetSid(u32),
    GetFullscreen(u32),
    GetTimePos(u32),
    GetPause(u32),
    GetSpeed(u32),
    GetAudioDelay(u32),
    GetSubDelay(u32),
    ShowNotReadyMsg(Vec<String>),
    ShowLoadingMsg(Vec<String>),
    ShowMsg { id: u32, text: String, duration: f64, mood: MsgMood },
    DeleteMsg(u32),
    ClearMessages,
    PlaylistRemoveCurrent,
    Exit
}

#[derive(Debug, PartialEq)]
enum Property {
    Aid,
    Sid,
    TimePos,
    Fullscreen,
    Pause,
    Speed,
    AudioDelay,
    SubDelay
}

#[derive(Debug, PartialEq, Deserialize_repr)]
#[repr(u8)]
pub enum MsgMood {
    Neutral = 0,
    Bad = 1,
    Good = 2,
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

pub struct IpcData {
    pub window: tauri::Window,
    pub app_state: Arc<AppState>,
}

pub async fn start(
    mut mpv_write_rx: Receiver<Interface>,
    pipe_id: String,
    window: tauri::Window,
    app_state: Arc<AppState>,
) -> Result<()> {
    let pipe_name = utils::get_pipe_name(&pipe_id)?;

    let conn = Stream::connect(pipe_name).await?;
    let (recv, mut sender) = conn.split();

    let (exit_tx, exit_rx) = oneshot::channel();
    let exit_tx_opt = Some(exit_tx);

    let ipc_data = IpcData { app_state, window };

    let listen_task = listen(recv, &ipc_data, exit_rx);
    let write_task = write(mpv_write_rx, sender, &ipc_data, exit_tx_opt);

    tokio::try_join!(listen_task, write_task);
    Ok(())
}

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
    Err(SyncmiruError::MpvObtainPropertyError)
}

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
    Err(SyncmiruError::MpvObtainPropertyError)
}

pub async fn get_audio_delay(ipc_data: &IpcData) -> Result<f64> {
    let mut rx = send_with_response(ipc_data, Property::AudioDelay).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(audio_delay) = data.as_f64() {
                return Ok(audio_delay)
            }
        }
    }
    Err(SyncmiruError::MpvObtainPropertyError)
}

pub async fn get_sub_delay(ipc_data: &IpcData) -> Result<f64> {
    let mut rx = send_with_response(ipc_data, Property::SubDelay).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(sub_delay) = data.as_f64() {
                return Ok(sub_delay)
            }
        }
    }
    Err(SyncmiruError::MpvObtainPropertyError)
}

pub async fn get_timestamp(ipc_data: &IpcData) -> Result<f64> {
    let mut rx = send_with_response(ipc_data, Property::TimePos).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(timepos) = data.as_f64() {
                return Ok(timepos)
            }
        }
    }
    Err(SyncmiruError::MpvObtainPropertyError)
}

pub async fn get_pause(ipc_data: &IpcData) -> Result<bool> {
    let mut rx = send_with_response(ipc_data, Property::Pause).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(pause) = data.as_bool() {
                return Ok(pause)
            }
        }
    }
    Err(SyncmiruError::MpvObtainPropertyError)
}

pub async fn get_speed(ipc_data: &IpcData) -> Result<Decimal> {
    let mut rx = send_with_response(ipc_data, Property::Speed).await?;
    if let Some(json) = rx.recv().await {
        if let Some(data) = json.get("data") {
            if let Some(speed_num) = data.as_number() {
                if let Ok(speed) = Decimal::from_str(&speed_num.to_string()) {
                    return Ok(speed)
                }
            }
        }
    }
    Err(SyncmiruError::MpvObtainPropertyError)
}

async fn send_with_response(ipc_data: &IpcData, property: Property) -> Result<Receiver<serde_json::Value>> {
    let req_id = ipc_data.app_state.get_mpv_next_req_id().await;

    let mpv_ipc_tx_rl = ipc_data.app_state.mpv_ipc_tx.read().await;
    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();

    let mut mpv_response_senders_wl = ipc_data.app_state.mpv_response_senders.write().await;
    let (tx, rx) = mpsc::channel::<serde_json::Value>(1);
    mpv_response_senders_wl.insert(req_id, tx);

    match property {
        Property::Aid => { mpv_ipc_tx.send(Interface::GetAid(req_id)).await? }
        Property::Sid => { mpv_ipc_tx.send(Interface::GetSid(req_id)).await? }
        Property::TimePos => { mpv_ipc_tx.send(Interface::GetTimePos(req_id)).await? }
        Property::Fullscreen => { mpv_ipc_tx.send(Interface::GetFullscreen(req_id)).await? }
        Property::Pause => { mpv_ipc_tx.send(Interface::GetPause(req_id)).await? },
        Property::Speed => { mpv_ipc_tx.send(Interface::GetSpeed(req_id)).await? },
        Property::AudioDelay => { mpv_ipc_tx.send(Interface::GetAudioDelay(req_id)).await? },
        Property::SubDelay => { mpv_ipc_tx.send(Interface::GetSubDelay(req_id)).await? }
    }
    Ok(rx)
}

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
                        println!("Connection closed");
                        break;
                     },
                     Ok(_) => {
                        println!("recv {}", buffer);
                        process_mpv_msg(&buffer, ipc_data).await?;
                        buffer.clear();
                     },
                     Err(e) => {
                        println!("Read error: {:?}", e);
                        break;
                     }
                }
            }
            _ = &mut exit_rx => {
                println!("listen exit called");
                break;
            }
        }
    }
    Ok(())
}

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
                        "{{\"command\":  [\"loadfile\", \"{}\", \"replace\", {{\"http-header-fields\": \"Authorization: Bearer {}\"}}]}}\n",
                        source_url,
                        jwt
                    );
                    sender.write_all(cmd.as_bytes()).await?;
                }
                Interface::LoadFromUrl(ref url) => {
                    let cmd = format!("{{\"command\":  [\"loadfile\", \"{}\", \"replace\"]}}\n",
                        url
                    );
                    sender.write_all(cmd.as_bytes()).await?;
                }
                Interface::SetPause(p) => {
                    let cmd = utils::create_set_property_cmd("pause", &p);
                    sender.write_all(cmd.as_bytes()).await?;
                }
                Interface::Seek(timestamp) => {
                    let cmd = utils::create_set_property_cmd("time-pos", &timestamp);
                    sender.write_all(cmd.as_bytes()).await?;
                }
                Interface::SetAudio { .. } => {}
                Interface::SetSubs { .. } => {}
                Interface::SetWindowSize { .. } => {}
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
                }
                Interface::GetAid(req_id) => {
                    let cmd = utils::create_get_property_cmd("aid", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                }
                Interface::GetSid(req_id) => {
                    let cmd = utils::create_get_property_cmd("sid", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                }
                Interface::GetFullscreen(req_id) => {
                    let cmd = utils::create_get_property_cmd("fullscreen", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                }
                Interface::GetTimePos(req_id) => {
                    let cmd = utils::create_get_property_cmd("time-pos", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetPause(req_id) => {
                    let cmd = utils::create_get_property_cmd("pause", req_id);
                    sender.write_all(cmd.as_bytes()).await?;
                },
                Interface::GetSpeed(req_id) => {
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
                    *mpv_not_ready_msg_id_wl = None;
                    *mpv_loading_msg_id_wl = None;
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
                            let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
                            sleep(Duration::from_millis(50)).await;
                            mpv::window::win32::hide_borders(&ipc_data.app_state, mpv_wid_rl.unwrap()).await?;
                        }
                        else {
                            ipc_data.window.emit("mpv-resize", {})?;
                        }
                    }
                }
                Interface::Exit => {
                    exit_tx_opt
                        .take()
                        .unwrap()
                        .send(())
                        .map_err(|e| anyhow!("killing interprocess mpv communication failed"))?;
                }
            }
            //println!("msg {:?}", msg);
        } else {
            println!("msg None");
            break;
        }
    }
    Ok(())
}

async fn init_observe_property(mut sender: &SendHalf) -> Result<()> {
    let properties = vec!["aid", "sid", "pause", "fullscreen", "speed", "audio-delay", "sub-delay"];
    for (i, property) in properties.iter().enumerate() {
        observe_property(sender, i, property).await?;
    }
    Ok(())
}

async fn observe_property(
    mut sender: &SendHalf,
    id: usize,
    name: &str,
) -> Result<()> {
    let cmd = format!("{{\"command\": [\"observe_property\", {}, \"{}\"] }}\n", id, name);
    sender.write_all(cmd.as_bytes()).await?;
    Ok(())
}

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

async fn fullscreen_changed(fullscreen_state: bool, ipc_data: &IpcData) -> Result<()> {
    let start = Instant::now();
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
                    mpv::window::win32::manual_fullscreen(&ipc_data.app_state, mpv_wid).await?;
                }
                else {
                    sleep(Duration::from_millis(70)).await;
                    let mpv_ipc_tx_rl = ipc_data.app_state.mpv_ipc_tx.read().await;
                    let mpv_ipc_tx = mpv_ipc_tx_rl.as_ref().unwrap();
                    mpv_ipc_tx.send(SetFullscreen(true)).await?;
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
    let end = Instant::now();
    let elapsed = end.duration_since(start);
    println!("elapsed {}", elapsed.as_millis());
    Ok(())
}

async fn process_client_msg(msg: &serde_json::Value, ipc_data: &IpcData) -> Result<()> {
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

fn process_file_loaded(ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-file-loaded", {}).ok();
}

fn process_playback_restart(ipc_data: &IpcData) -> Result<()> {
    cfg_if! {
        if #[cfg(target_family = "unix")] {
            ipc_data.window.emit("mpv-resize", {})?;
        }
    }
    Ok(())
}

fn process_end_file(msg: &serde_json::Value, ipc_data: &IpcData) -> Result<()> {
    if let Some(reason_v) = msg.get("reason") {
        let reason = reason_v.as_str().unwrap();
        if reason == "error" {
            ipc_data.window.emit("mpv-file-load-failed", {}).ok();
        }
    }
    Ok(())
}

fn process_idle_msg(ipc_data: &IpcData) -> Result<()> {
    cfg_if! {
        if #[cfg(target_family = "unix")] {
            ipc_data.window.emit("mpv-resize", {})?;
        }
    }
    Ok(())
}

fn pause_changed(pause_state: bool, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-pause-changed", pause_state).ok();
}

async fn process_seek_msg(ipc_data: &IpcData) -> Result<()> {
    let mut mpv_ignore_next_seek_event_wl = ipc_data.app_state.mpv_ignore_next_seek_event.write().await;
    if *mpv_ignore_next_seek_event_wl {
        *mpv_ignore_next_seek_event_wl = false;
        return Ok(())
    }

    ipc_data.window.emit("mpv-seek", {}).ok();
    Ok(())
}

fn speed_changed(speed: &Decimal, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-speed-changed", speed).ok();
}

fn sub_delay_changed(sub_delay: f64, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-sub-delay-changed", sub_delay).ok();
}

fn audio_delay_changed(audio_delay: f64, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-audio-delay-changed", audio_delay).ok();
}

fn audio_track_changed(aid: Option<u64>, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-audio-changed", aid).ok();
}

fn sub_track_changed(sid: Option<u64>, ipc_data: &IpcData) {
    ipc_data.window.emit("mpv-sub-changed", sid).ok();
}