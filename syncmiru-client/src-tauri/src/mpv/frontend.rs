use crate::appstate::AppState;
use crate::mpv::{start_process, stop_process};
use crate::result::Result;

#[tauri::command]
pub async fn mpv_start(state: tauri::State<'_, AppState>, window: tauri::Window) -> Result<()> {
    println!("mpv start");
    start_process(&state)?;
    let appdata = state.appdata.read().await;
    Ok(())
}

#[tauri::command]
pub async fn mpv_quit(state: tauri::State<'_, AppState>) -> Result<()> {
    stop_process()?;
    println!("mpv quit");
    Ok(())
}