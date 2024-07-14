use tokio::sync::mpsc;
use tokio::sync::mpsc::{Sender, Receiver};
use tokio::task;
use crate::appstate::AppState;
use crate::mpv::{gen_pipe_id, ipc, start_process, stop_process};
use crate::result::Result;

#[tauri::command]
pub async fn mpv_start(state: tauri::State<'_, AppState>, window: tauri::Window) -> Result<()> {
    println!("mpv start");

    let pipe_id = gen_pipe_id();
    start_process(&state, &pipe_id, window).await?;
    let (tx, rx): (Sender<ipc::Interface>, Receiver<ipc::Interface>) = mpsc::channel(1024);
    task::spawn(ipc::start(rx, pipe_id, window));

    let appdata = state.appdata.read().await;
    Ok(())
}

#[tauri::command]
pub async fn mpv_quit(state: tauri::State<'_, AppState>) -> Result<()> {
    stop_process()?;
    println!("mpv quit");
    Ok(())
}