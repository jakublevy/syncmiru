use anyhow::anyhow;
use interprocess::local_socket::{
    tokio::{prelude::*, Stream},
    GenericFilePath, GenericNamespaced,
};
use interprocess::local_socket::tokio::{RecvHalf, SendHalf};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::sync::mpsc::Receiver;
use tokio::sync::{oneshot};
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

pub async fn start(
    mut rx: Receiver<Interface>,
    pipe_id: String,
    window: tauri::Window,
) -> Result<()> {
    let pipe_name = get_pipe_name(&pipe_id)?;

    let conn = Stream::connect(pipe_name).await?;
    let (recv, mut sender) = conn.split();

    let (exit_tx, exit_rx) = oneshot::channel();
    let exit_tx_opt = Some(exit_tx);

    let listen_task = listen(recv, window.clone(), exit_rx);
    let write_task = write(rx, sender, window, exit_tx_opt);

    tokio::try_join!(listen_task, write_task);
    Ok(())
}

async fn listen(
    recv: RecvHalf,
    window: tauri::Window,
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
                        println!("listen Received: {}", buffer);
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
    window: tauri::Window,
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

fn get_pipe_name(pipe_id: &str) -> Result<interprocess::local_socket::Name> {
    let pipe_path = get_pipe_ipc_path(pipe_id);
    if cfg!(target_family = "windows") {
        Ok(pipe_path.to_ns_name::<GenericNamespaced>()?)
    }
    else {
        Ok(pipe_path.to_fs_name::<GenericFilePath>()?)
    }
}