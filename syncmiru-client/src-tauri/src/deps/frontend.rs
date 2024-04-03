use crate::appstate::AppState;
use crate::deps::{download, latest_mpv_download_link, latest_yt_dlp_download_link};
use crate::deps::utils::{delete_mpv, delete_yt_dlp, decompress_yt_dlp_archive, decompress_mpv_archive};
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
    decompress_mpv_archive(&window, &d.join("_mpv"), &d.join("mpv"), "mpv-")?;

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
    decompress_yt_dlp_archive(&window, &d.join("_yt-dlp"), &d.join("yt-dlp"), "yt-dlp-")?;

    delete_tmp()?;
    let mut appdata = state.appdata.write()?;
    appdata.yt_dlp_version = Some(yt_dlp_release.version);
    appdata.deps_managed = true;
    Ok(())
}
