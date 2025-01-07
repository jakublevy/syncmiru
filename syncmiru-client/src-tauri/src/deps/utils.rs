//! This module contains helper functions for managing and interacting with the mpv and yt-dlp dependencies.

use std::fs;
use std::path::{Path, PathBuf};
use tauri::{Emitter};
use crate::files::syncmiru_data_dir;
use crate::result::Result;
use crate::files::{decompress_7z, decompress_zip};

/// Returns the directory path where the mpv dependency is stored.
///
/// # Returns
/// - `Result<PathBuf>`: The directory path to mpv directory.
pub fn mpv_dir() -> Result<PathBuf> {
    Ok(syncmiru_data_dir()?.join("mpv"))
}


/// Returns the directory path where the yt-dlp dependency is stored.
///
/// # Returns
/// - `Result<PathBuf>`: The directory path to yt-dlp directory.
pub fn yt_dlp_dir() -> Result<PathBuf> {
    Ok(syncmiru_data_dir()?.join("yt-dlp"))
}


/// Returns the path to the mpv executable.
///
/// # Returns
/// - `Result<PathBuf>`: The path to mpv executable file (with the correct suffix for the platform).
pub fn mpv_exe() -> Result<PathBuf> {
    Ok(mpv_dir()?.join(format!("mpv{}", exe_suffix())))
}


/// Returns the path to the yt-dlp executable.
///
/// # Returns
/// - `Result<PathBuf>`: The path to yt-dlp executable file (with the correct suffix for the platform).
pub fn yt_dlp_exe() -> Result<PathBuf> {
    Ok(yt_dlp_dir()?.join(format!("yt-dlp{}", exe_suffix())))
}


/// Returns the path to the `prelude.lua` file.
///
/// # Returns
/// - `Result<PathBuf>`: The path to the `prelude.lua` file.
pub fn prelude_path() -> Result<PathBuf> {
    Ok(syncmiru_data_dir()?.join("prelude.lua"))
}


/// Deletes the mpv directory if it exists.
///
/// # Returns
/// - `Result<()>`: Indicates whether the deletion was successful.
pub(super) fn delete_mpv() -> Result<()> {
    let mpv_dir = mpv_dir()?;
    if mpv_dir.exists() {
        fs::remove_dir_all(mpv_dir)?;
    }
    Ok(())
}


/// Deletes the `yt-dlp` directory if it exists.
///
/// # Returns
/// - `Result<()>`: Indicates whether the deletion was successful.
pub(super) fn delete_yt_dlp() -> Result<()> {
    let yt_dlp_dir = yt_dlp_dir()?;
    if yt_dlp_dir.exists() {
        fs::remove_dir_all(yt_dlp_dir)?;
    }
    Ok(())
}


/// Returns the appropriate file extension suffix for the platform (e.g., `.exe` for Windows, empty for Unix-like systems).
///
/// # Returns
/// - `String`: The file extension suffix based on the platform.
fn exe_suffix() -> String {
    let mut suffix = "";
    if cfg!(target_family = "windows") {
        suffix = ".exe"
    }
    suffix.to_string()
}

/// Decompresses the mpv archive and emits an event when the extraction is finished.
///
/// # Parameters
/// - `window`: The Tauri window object to emit progress updates to the frontend.
/// - `from`: The path to the archive to be decompressed.
/// - `into`: The target directory to extract the contents into.
/// - `event_name_prefix`: The prefix for the event name to emit upon completion.
///
/// # Returns
/// - `Result<()>`: Indicates whether the decompression was successful.
pub(super) fn decompress_mpv_archive(window: &tauri::Window, from: impl AsRef<Path>, into: impl AsRef<Path>, event_name_prefix: &str) -> Result<()> {
    decompress_7z(from, into)?;
    window.emit(
        &format!("{}extract-finished", event_name_prefix),
        { }
    )?;
    Ok(())
}


/// Decompresses the yt-dlp archive and emits an event when the extraction is finished.
///
/// # Parameters
/// - `window`: The Tauri window object to emit progress updates to the frontend.
/// - `from`: The path to the archive to be decompressed.
/// - `into`: The target directory to extract the contents into.
/// - `event_name_prefix`: The prefix for the event name to emit upon completion.
///
/// # Returns
/// - `Result<()>`: Indicates whether the decompression was successful.
pub(super) fn decompress_yt_dlp_archive(window: &tauri::Window, from: impl AsRef<Path>, into: impl AsRef<Path>, event_name_prefix: &str) -> Result<()> {
    decompress_zip(from, into)?;
    window.emit(
        &format!("{}extract-finished", event_name_prefix),
        { }
    )?;
    Ok(())
}