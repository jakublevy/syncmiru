use std::thread::sleep;
use std::time::Duration;
use tokio::sync::mpsc::Receiver;

pub enum Interface {
    Play,
    Pause,
    Seek { timestamp: u64 },
    ChangeAudio { aid: u64 },
    ChangeSubs { sid: u64 },
    SetWindowSize { w: u32, h: u32 }
    // TODO:
}

pub async fn start(
    mut rx: Receiver<Interface>,
    pipe_name: String,
    window: tauri::Window
) {
   // TODO:
}