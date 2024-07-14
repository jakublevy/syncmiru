use std::sync::Arc;
use crate::appstate::AppState;
use crate::config::appdata;
use crate::deps::{DepsAvailable, DepsVersions, download, latest_mpv_download_link, latest_yt_dlp_download_link};
use crate::deps::utils::{delete_mpv, delete_yt_dlp, decompress_yt_dlp_archive, decompress_mpv_archive, mpv_dir};
use crate::files::{delete_tmp, syncmiru_data_dir};
use crate::result::Result;

#[tauri::command]
pub async fn get_deps_state(state: tauri::State<'_, Arc<AppState>>) -> Result<DepsAvailable> {
    let mut appdata = state.appdata.write().await;
    if cfg!(target_family = "windows") {
        if appdata.deps_managed {
            let local = DepsAvailable::from_params(true)?;
            if local.all_available() {
                return Ok(local)
            }
        }
        let global = DepsAvailable::from_params(false)?;
        if global.all_available() {
            appdata.deps_managed = false;
            appdata::write(&appdata)?;
        }
        Ok(global)
    }
    else {
        let di = DepsAvailable::from_params(appdata.deps_managed)?;
        Ok(di)
    }
}

#[tauri::command]
pub async fn get_deps_versions_fetch(state: tauri::State<'_, Arc<AppState>>) -> Result<DepsVersions> {
    let mpv = latest_mpv_download_link().await?;
    let yt_dlp = latest_yt_dlp_download_link().await?;
    let appdata = state.appdata.read().await;
    Ok(DepsVersions{
        mpv_cur: appdata.mpv_version.clone().unwrap(),
        yt_dlp_cur: appdata.yt_dlp_version.clone().unwrap(),
        mpv_newest: mpv.version,
        yt_dlp_newest: yt_dlp.version
    })
}

#[tauri::command]
pub async fn mpv_start_downloading(window: tauri::Window, state: tauri::State<'_, Arc<AppState>>) -> Result<()> {
    delete_mpv()?;
    delete_tmp()?;

    let mpv_release = latest_mpv_download_link().await?;
    download(&window, &mpv_release, "_mpv", "mpv-").await?;

    let d = syncmiru_data_dir()?;
    decompress_mpv_archive(&window, &d.join("_mpv"), &d.join("mpv"), "mpv-")?;

    delete_tmp()?;
    let mut appdata = state.appdata.write().await;
    appdata.mpv_version = Some(mpv_release.version);

    Ok(())
}

#[tauri::command]
pub async fn yt_dlp_start_downloading(window: tauri::Window, state: tauri::State<'_, Arc<AppState>>) -> Result<()> {
    delete_yt_dlp()?;

    let yt_dlp_release = latest_yt_dlp_download_link().await?;
    download(&window, &yt_dlp_release, "_yt-dlp", "yt-dlp-").await?;

    let d = syncmiru_data_dir()?;
    decompress_yt_dlp_archive(&window, &d.join("_yt-dlp"), &d.join("yt-dlp"), "yt-dlp-")?;

    delete_tmp()?;
    let mut appdata = state.appdata.write().await;
    appdata.yt_dlp_version = Some(yt_dlp_release.version);
    appdata.deps_managed = true;
    Ok(())
}