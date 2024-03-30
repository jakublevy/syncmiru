use std::sync::RwLock;
use tauri::Manager;
use crate::appstate::AppState;
use crate::config::appdata::{AppData, write_config};
use crate::deps::{decompress, download, latest_mpv_download_link};
use crate::deps::utils::{delete_mpv};
use crate::files::{delete_tmp, syncmiru_data_dir};
use crate::result::Result;

#[derive(Clone, serde::Serialize)]
pub(super) struct DownloadStartFrontend<'a> {
    pub url: &'a str,
    pub size: u64,
}

#[derive(Copy, Clone, serde::Serialize)]
pub(super) struct DownloadProgressFrontend {
    pub speed: u64,
    pub received: u64,
}

#[tauri::command]
pub async fn mpv_start_downloading(window: tauri::Window, state: tauri::State<'_, AppState>) -> Result<()> {
    delete_mpv()?;
    delete_tmp()?;

    let mpv_release = latest_mpv_download_link().await?;
    download(&window, &mpv_release, "mpv-").await?;

    let d = syncmiru_data_dir()?;
    decompress(&window, d.join("_mpv").as_path(), d.join("mpv").as_path(), "mpv-")?;

    let mut appdata = state.appdata.write()?;
    appdata.first_run_seen = true;
    appdata.deps_managed = true;
    appdata.mpv_version = Some(mpv_release.version);

    Ok(())
}

fn finish_first_run(appdata: &RwLock<AppData>) -> Result<()> {
    let mut appdata = appdata.write()?;
    appdata.first_run_seen = true;
    appdata.deps_managed = true;
    write_config(&appdata)?;
    Ok(())
}

// #[tauri::command]
// pub async fn yt_dlp_start_downloading(state: tauri::State<'_, AppState>) -> Result<()> {
//     // rm local/yt-dlp
//     //start downloading
//     Ok(())
// }

// #[tauri::command]
// pub async fn test_emit(window: tauri::Window, state: tauri::State<'_, AppState>) -> Result<()> {
//     window.emit("test-emit", DownloadProgressFrontend { received: 10 })?;
//     Ok(())
// }