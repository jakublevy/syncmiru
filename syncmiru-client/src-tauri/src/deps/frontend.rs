use tauri::Manager;
use crate::appstate::AppState;
use crate::config::appdata::{write_config};
use crate::deps::{download, latest_mpv_download_link, latest_yt_dlp_download_link};
use crate::deps::utils::{delete_mpv, delete_yt_dlp, decompress_zip, decompress_7z};
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
    download(&window, &mpv_release, "_mpv", "mpv-").await?;

    let d = syncmiru_data_dir()?;
    decompress_7z(&window, d.join("_mpv").as_path(), d.join("mpv").as_path(), "mpv-")?;

    let mut appdata = state.appdata.write()?;
    appdata.mpv_version = Some(mpv_release.version);

    Ok(())
}

#[tauri::command]
pub async fn yt_dlp_start_downloading(window: tauri::Window, state: tauri::State<'_, AppState>) -> Result<()> {
    delete_yt_dlp()?;

    let yt_dlp_release = latest_yt_dlp_download_link().await?;
    download(&window, &yt_dlp_release, "_yt-dlp", "yt-dlp-").await?;

    let d = syncmiru_data_dir()?;
    decompress_zip(&window, d.join("_yt-dlp").as_path(), d.join("yt-dlp").as_path(), "yt-dlp-")?;


    delete_tmp()?;
    let mut appdata = state.appdata.write()?;
    appdata.yt_dlp_version = Some(yt_dlp_release.version);
    appdata.first_run_seen = true;
    appdata.deps_managed = true;
    write_config(&appdata)?;
    Ok(())
}
