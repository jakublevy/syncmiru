use std::sync::Arc;
use anyhow::anyhow;
use interprocess::local_socket::{
    tokio::{prelude::*, Stream},
    GenericFilePath, GenericNamespaced,
};
use interprocess::local_socket::tokio::{RecvHalf, SendHalf};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::sync::mpsc::Receiver;
use tokio::sync::{oneshot};
use crate::appstate::AppState;
use crate::mpv;
use crate::mpv::get_pipe_ipc_path;
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
    Exit
    // TODO:
}

struct IpcData {
    window: tauri::Window,
    app_state: Arc<AppState>
}

pub async fn start(
    mut rx: Receiver<Interface>,
    pipe_id: String,
    window: tauri::Window,
    app_state: Arc<AppState>
) -> Result<()> {
    let pipe_name = get_pipe_name(&pipe_id)?;

    let conn = Stream::connect(pipe_name).await?;
    let (recv, mut sender) = conn.split();

    let (exit_tx, exit_rx) = oneshot::channel();
    let exit_tx_opt = Some(exit_tx);

    let ipc_data = IpcData { app_state, window };

    let listen_task = listen(recv, &ipc_data, exit_rx);
    let write_task = write(rx, sender, &ipc_data, exit_tx_opt);

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
    sender: SendHalf,
    ipc_data: &IpcData,
    mut exit_tx_opt: Option<oneshot::Sender<()>>,
) -> Result<()> {
    init_observe_property(&sender).await?;
    loop {
        let msg_opt = rx.recv().await;
        if let Some(msg) = msg_opt {
            if msg == Interface::Exit {
                exit_tx_opt
                    .take()
                    .unwrap()
                    .send(())
                    .map_err(|e| anyhow!("killing interprocess mpv communication failed"))?;
            }
            println!("todo handle msg {:?}", msg);
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
    println!("{:?}", json);
    if let Some(event) = json.get("event") {
        if let Some(event_msg) = event.as_str() {
            match event_msg {
                "property-change" => {}
                "client-message" => { process_client_msg(&json, ipc_data).await? }
                _ => {}
            }
        }
    }
    Ok(())
}

async fn process_client_msg(msg: &serde_json::Value, ipc_data: &IpcData) -> Result<()> {
    if let Some(args_value) = msg.get("args") {
        if let Some(args) =  args_value.as_array() {
            if args.len() == 1 {
                let cmd = args.get(0).unwrap().as_str().unwrap();
                if cmd == "mouse-enter" {
                    println!("mouse-enter msg todo")
                }
                else if cmd == "mouse-btn-clicked" {
                    focus_mpv(ipc_data).await?;
                    println!("mouse-btn-clicked msg todo")
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
    }
    else {
        Ok(pipe_path.to_fs_name::<GenericFilePath>()?)
    }
}