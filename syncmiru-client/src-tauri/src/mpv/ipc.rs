use std::sync::Arc;
use std::time::Duration;
use anyhow::anyhow;
use interprocess::local_socket::{
    tokio::{prelude::*, Stream},
    GenericFilePath, GenericNamespaced,
};
use interprocess::local_socket::tokio::{RecvHalf, SendHalf};
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::sync::mpsc::{Sender, Receiver};
use tokio::sync::{oneshot};
use tokio::time::sleep;
use crate::appstate::AppState;
use crate::mpv;
use crate::mpv::get_pipe_ipc_path;
use crate::mpv::ipc::Interface::SetFullscreen;
use crate::result::Result;

#[derive(Debug, PartialEq)]
pub enum Interface {
    PlayFromSource { source: String, path: String, jwt: String },
    PlayFromUrl { url: String },
    Pause { state: bool },
    Seek { timestamp: u64 },
    ChangeAudio { aid: u64 },
    ChangeSubs { sid: u64 },
    SetWindowSize { w: u32, h: u32 },
    SetFullscreen,
    Exit,
    // TODO:
}

struct IpcData {
    window: tauri::Window,
    app_state: Arc<AppState>,
    mpv_write_tx: Sender<Interface>,
}

pub async fn start(
    mut mpv_write_tx: Sender<Interface>,
    mut mpv_write_rx: Receiver<Interface>,
    pipe_id: String,
    window: tauri::Window,
    app_state: Arc<AppState>,
) -> Result<()> {
    let pipe_name = get_pipe_name(&pipe_id)?;

    let conn = Stream::connect(pipe_name).await?;
    let (recv, mut sender) = conn.split();

    let (exit_tx, exit_rx) = oneshot::channel();
    let exit_tx_opt = Some(exit_tx);

    let ipc_data = IpcData { app_state, window, mpv_write_tx };

    let listen_task = listen(recv, &ipc_data, exit_rx);
    let write_task = write(mpv_write_rx, sender, &ipc_data, exit_tx_opt);

    tokio::try_join!(listen_task, write_task);
    Ok(())
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
                        println!("listen {}", buffer);
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
                Interface::PlayFromSource { .. } => {}
                Interface::PlayFromUrl { .. } => {}
                Interface::Pause { .. } => {}
                Interface::Seek { .. } => {}
                Interface::ChangeAudio { .. } => {}
                Interface::ChangeSubs { .. } => {}
                Interface::SetWindowSize { .. } => {}
                Interface::SetFullscreen => {
                    sender.write_all(b"{\"command\": [\"set\", \"fullscreen\", \"yes\"]}\n").await?;
                }
                Interface::Exit => {
                    exit_tx_opt
                        .take()
                        .unwrap()
                        .send(())
                        .map_err(|e| anyhow!("killing interprocess mpv communication failed"))?;
                }
            }
            println!("msg {:?}", msg);
        } else {
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
                _ => {}
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
    cfg_if::cfg_if! {
        if #[cfg(target_family = "unix")] {
            {
                let mut mpv_ignore_next_fullscreen_event_rl = ipc_data.app_state.mpv_ignore_next_fullscreen_event.write().await;
                if *mpv_ignore_next_fullscreen_event_rl {
                    *mpv_ignore_next_fullscreen_event_rl = false;
                    return Ok(())
                }
            }
        }
    }
    if fullscreen_state {
        let mut appdata_wl = ipc_data.app_state.appdata.write().await;
        let mpv_win_detached = appdata_wl.mpv_win_detached;
        if !mpv_win_detached {
            let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
            let mpv_wid = mpv_wid_rl.unwrap();

            cfg_if::cfg_if! {
                if #[cfg(target_family = "unix")] {
                    {
                        let mut mpv_ignore_next_fullscreen_event_wl = ipc_data.app_state.mpv_ignore_next_fullscreen_event.write().await;
                        *mpv_ignore_next_fullscreen_event_wl = true;
                    }
                }
            }
            mpv::window::detach(&ipc_data.app_state, mpv_wid).await?;

            cfg_if::cfg_if! {
                if #[cfg(target_family = "windows")] {
                    mpv::window::win32::manual_fullscreen(&ipc_data.app_state, mpv_wid).await?;
                }
                else {
                    sleep(Duration::from_millis(50)).await;
                    ipc_data.mpv_write_tx.send(SetFullscreen).await?;
                }
            }

            appdata_wl.mpv_win_detached = true;

            let mut mpv_reattach_on_fullscreen_false_wl = ipc_data.app_state.mpv_reattach_on_fullscreen_false.write().await;
            *mpv_reattach_on_fullscreen_false_wl = true;

            ipc_data.window.emit("mpv-win-detached-changed", true).ok();

        }
    }
    else {
        let mut mpv_reattach_on_fullscreen_false_wl = ipc_data.app_state.mpv_reattach_on_fullscreen_false.write().await;
        if *mpv_reattach_on_fullscreen_false_wl {
            *mpv_reattach_on_fullscreen_false_wl = false;
            drop(mpv_reattach_on_fullscreen_false_wl);

            let mut appdata_wl = ipc_data.app_state.appdata.write().await;
            let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
            let mpv_wid = mpv_wid_rl.unwrap();

            mpv::window::attach(&ipc_data.app_state, &ipc_data.window, mpv_wid).await?;
            appdata_wl.mpv_win_detached = false;
            ipc_data.window.emit("mpv-win-detached-changed", false).ok();
            println!("attach back")
        }
    }
    Ok(())
}

async fn process_client_msg(msg: &serde_json::Value, ipc_data: &IpcData) -> Result<()> {
    if let Some(args_value) = msg.get("args") {
        if let Some(args) = args_value.as_array() {
            if args.len() == 1 {
                let cmd = args.get(0).unwrap().as_str().unwrap();
                if cmd == "mouse-enter" {} else if cmd == "mouse-btn-click" {
                    focus_mpv(ipc_data).await?;
                }
            }
        }
    }
    Ok(())
}

async fn focus_mpv(ipc_data: &IpcData) -> Result<()> {
    let mpv_wid_rl = ipc_data.app_state.mpv_wid.read().await;
    if let Some(mpv_wid) = *mpv_wid_rl {
        mpv::window::focus(&ipc_data.app_state, mpv_wid).await?;
    }
    Ok(())
}

fn get_pipe_name(pipe_id: &str) -> Result<interprocess::local_socket::Name> {
    let pipe_path = get_pipe_ipc_path(pipe_id);
    if cfg!(target_family = "windows") {
        Ok(pipe_path.to_ns_name::<GenericNamespaced>()?)
    } else {
        Ok(pipe_path.to_fs_name::<GenericFilePath>()?)
    }
}