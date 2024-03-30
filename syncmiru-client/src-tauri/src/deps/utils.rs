use std::fs;
use std::fs::File;
use std::path::{Path, PathBuf};
use tauri::Manager;
use zip::ZipArchive;
use crate::files::syncmiru_data_dir;
use crate::result::Result;

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
    Ok(yt_dlp_dir()?.join(format!("yt-dlp{}", exe_suffix())))
}

pub(super) fn delete_mpv() -> Result<()> {
    let mpv_dir = mpv_dir()?;
    if mpv_dir.exists() {
        fs::remove_dir_all(mpv_dir)?;
    }
    Ok(())
}

pub(super) fn delete_yt_dlp() -> Result<()> {
    let yt_dlp_dir = yt_dlp_dir()?;
    if yt_dlp_dir.exists() {
        fs::remove_dir_all(yt_dlp_dir)?;
    }
    Ok(())
}

fn exe_suffix() -> String {
    let mut suffix = "";
    if cfg!(target_family = "windows") {
        suffix = ".exe"
    }
    suffix.to_string()
}

pub(super) fn decompress_7z(window: &tauri::Window, from: &Path, into: &Path, event_name_prefix: &str) -> Result<()> {
    if !into.exists() {
        fs::create_dir_all(into)?;
    }
    sevenz_rust::decompress_file(from, into)?;
    window.emit(
        &format!("{}extract-finished", event_name_prefix),
        { }
    )?;
    Ok(())
}

pub(super) fn decompress_zip(window: &tauri::Window, from: &Path, into: &Path, event_name_prefix: &str) -> Result<()> {
    if !into.exists() {
        fs::create_dir_all(into)?;
    }
    let file = File::open(from)?;
    let mut archive = ZipArchive::new(file)?;
    archive.extract(into)?;

    window.emit(
        &format!("{}extract-finished", event_name_prefix),
        { }
    )?;
    Ok(())
}