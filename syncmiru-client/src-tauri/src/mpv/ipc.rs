#[cfg(target_family = "windows")]
pub mod win32;
mod utils;

use std::sync::Arc;
use std::time::Duration;
use anyhow::{anyhow, Context};
use cfg_if::cfg_if;
use interprocess::local_socket::{
    tokio::{prelude::*, Stream},
};
use interprocess::local_socket::tokio::{RecvHalf, SendHalf};
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::sync::mpsc::{Receiver, Sender};
use tokio::sync::{mpsc, oneshot};
use tokio::time::{sleep, Instant};
use crate::appstate::AppState;
use crate::{constants, mpv};
use crate::error::SyncmiruError;
use crate::mpv::ipc::Interface::SetFullscreen;
use crate::result::Result;

#[derive(Debug, PartialEq)]
pub enum Interface {
    LoadFromSource { source_url: String, jwt: String },
    LoadFromUrl(String),
    SetPause(bool),
    Seek(f64),
    ChangeAudio(u64),
    ChangeSubs(u64),
    SetWindowSize { w: u32, h: u32 },
    SetFullscreen(bool),
    GetAid(u32),
    GetSid(u32),
    GetFullscreen(u32),
    GetTimePos(u32),
    PlaylistRemoveCurrent,
    Exit,
    Nop
}

#[derive(Debug, PartialEq)]
enum Property {
    Aid,
    Sid,
    TimePos,
    Fullscreen,
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

pub async fn send_cmd_wait(tx: &Sender<Interface>, cmd: Interface) -> Result<()> {
    tx.send(cmd).await?;
    tx.send(Interface::Nop).await?;
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
        println!("{:?}", json);
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
                Interface::LoadFromSource {  ref source_url, ref jwt } => {
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
                    let cmd = format!("{{\"command\": [\"set_property\", \"pause\", {}]}}\n", p);
                    sender.write_all(cmd.as_bytes()).await?;
                }
                Interface::Seek { .. } => {}
                Interface::ChangeAudio { .. } => {}
                Interface::ChangeSubs { .. } => {}
                Interface::SetWindowSize { .. } => {}
                Interface::SetFullscreen(state) => {
                    let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
                    let cmd = format!("{{\"command\": [\"set\", \"fullscreen\", \"{}\"]}}\n", utils::bool2_yn(state));
                    sender.write_all(cmd.as_bytes()).await?;

                    mpv::window::focus(&ipc_data.app_state, mpv_wid_rl.unwrap()).await?;
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
                },
                Interface::Nop => {}
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
    let properties = vec!["aid", "sid", "pause", "fullscreen"];
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
                "file-loaded" => { process_file_loaded(ipc_data).await?; }
                "playback-restart" => { process_playback_restart(ipc_data)?; }
                "end-file" => { process_end_file(&json, ipc_data)?; }
                "idle" => { process_idle_msg(ipc_data)?; }
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

async fn process_file_loaded(ipc_data: &IpcData) -> Result<()> {
    ipc_data.window.emit("mpv-file-loaded", {}).ok();
    Ok(())
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