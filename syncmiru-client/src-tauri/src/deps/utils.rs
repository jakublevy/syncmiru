use std::fs;
use std::path::{PathBuf};
use crate::result::Result;
use crate::config::utils::syncmiru_data_dir;

pub fn mpv_dir() -> Result<PathBuf> {
    Ok(syncmiru_data_dir()?.join("mpv"))
}

pub fn yt_dlp_dir() -> Result<PathBuf> {
    Ok(syncmiru_data_dir()?.join("yt-dlp"))
}

pub fn mpv_exe() -> Result<PathBuf> {
    Ok(mpv_dir()?.join(format!("mpv{}", exe_suffix())))
}

pub fn yt_dlp_exe() -> Result<PathBuf> {
    Ok(mpv_dir()?.join(format!("yt-dlp{}", exe_suffix())))
}

fn exe_suffix() -> String {
    let mut suffix = "";
    if cfg!(target_family = "windows") {
        suffix = ".exe"
    }
    suffix.to_string()
}

pub(super) fn delete_deps() -> Result<()> {
    let mpv_dir = mpv_dir()?;
    if mpv_dir.exists() {
        fs::remove_dir_all(mpv_dir)?;
    }
    let yt_dlp_dir = yt_dlp_dir()?;
    if yt_dlp_dir.exists() {
        fs::remove_dir_all(yt_dlp_dir)?;
    }
    Ok(())
}
