//! This module handles the management of dependencies used throughout the application,
//! specifically `mpv` and `yt-dlp`. It provides functionality for retrieving the latest versions
//! of these dependencies, checking if they are installed and functional on the user's system,
//! and downloading them if needed.

use std::fs::File;
use std::io::{Write};
use std::process::Command;
use std::time::{Duration, Instant};
use anyhow::Context;
use cfg_if::cfg_if;
use reqwest::Client;
use serde::Serialize;
use tauri::{Emitter};
use crate::constants;
use crate::deps::utils::{mpv_exe, yt_dlp_exe};
use crate::error::SyncmiruError;
use crate::files::syncmiru_data_dir;
use crate::result::Result;

#[cfg(target_family = "windows")]
use std::os::windows::process::CommandExt;

pub mod frontend;
pub mod utils;

/// Represents the information of a download's start, including the URL and size.
#[derive(Clone, serde::Serialize)]
pub struct DownloadStart<'a> {
    /// URL of the file to download
    pub url: &'a str,

    /// Size of the file in bytes
    pub size: u64,
}

/// Represents the download progress, including the download speed and received data.
#[derive(Copy, Clone, serde::Serialize)]
pub struct DownloadProgress {
    /// Download speed in bytes per second
    pub speed: u64,

    /// Amount of data received in bytes
    pub received: u64,
}

/// Represents the information about available dependencies, including their URL and version.
struct DepRelease {
    /// URL where the dependency can be obtained
    url: String,

    /// Version of the dependency
    version: String,
}

/// Struct to hold the versions of the `mpv` and `yt-dlp` dependencies,
/// both current and the latest available versions.
#[derive(serde::Serialize)]
pub struct DepsVersions {
    /// Currently used mpv version
    mpv_cur: String,

    /// Latest version of mpv available
    mpv_newest: String,

    /// Currently used yt-dlp version
    yt_dlp_cur: String,

    /// Latest version of yt-dlp available
    yt_dlp_newest: String
}

/// Fetches the latest MPV release URL and version from the configured release source.
/// Return:
/// - `Result<DepRelease>`: The latest MPV release information, or an error if the information cannot be retrieved.
async fn latest_mpv_download_link() -> Result<DepRelease> {
    let mut api_url = constants::MPV_RELEASES_URL;
    if is_x86_feature_detected!("avx2") {
        api_url = constants::MPV_AVX2_RELEASES_URL;
    }
    let client = Client::new();
    let response = client
        .get(api_url)
        .timeout(Duration::from_secs(constants::HTTP_TIMEOUT))
        .send()
        .await?;
    let xml_raw = response.text().await?;
    let doc = roxmltree::Document::parse(&xml_raw)?;
    let item = doc
        .descendants()
        .filter(|n|n.has_tag_name("item"))
        .next()
        .context("xml missing tag")?;

    let link_node = item
        .descendants()
        .filter(|n|n.has_tag_name("link"))
        .next()
        .context("xml missing tag")?;

    let link = link_node
        .text()
        .context("Link is missing")?;

    let paths = link
        .split("/")
        .collect::<Vec<&str>>();

    if paths.len() < 8 {
        return Err(SyncmiruError::LatestVersionMissingError)
    }
    let filename_split = paths[7]
        .split("-")
        .collect::<Vec<&str>>();

    if filename_split.len() < 4 {
        return Err(SyncmiruError::LatestVersionMissingError)
    }

    let version = filename_split[3];

    Ok(DepRelease{ url: link.to_string(), version: version.to_string() })
}

/// Fetches the latest release URL and version for `yt-dlp` from GitHub.
/// Return:
/// - `Result<DepRelease>`: Returns the latest `yt-dlp` release information, or an error if the information cannot be retrieved.
async fn latest_yt_dlp_download_link() -> Result<DepRelease> {
    let octocrab = octocrab::instance();
    let page = octocrab.repos("yt-dlp", "yt-dlp")
        .releases()
        .list()
        .per_page(1)
        .send()
        .await?;
    let newest_release = page.items
        .get(0)
        .context("release missing")?;
    for asset in &newest_release.assets {
        if asset.name == "yt-dlp_win.zip" {
            return Ok(DepRelease { url: asset.browser_download_url.to_string(), version: newest_release.tag_name.clone() })
        }
    }
    Err(SyncmiruError::LatestVersionMissingError)
}

/// Downloads the dependency from the provided `release` URL and reports download progress.
///
/// Arguments:
/// - `window: &tauri::Window`: A reference to the Tauri window for emitting events.
/// - `release: &DepRelease`: The release information, including the URL and version to download.
/// - `dst: &str`: The destination path to store the downloaded file.
/// - `event_name_prefix: &str`: Prefix to use when emitting download-related events (mpv-, yt-dlp-).
///
/// Return:
/// - `Result<()>`: Returns `Ok(())` if the download is successful, or an error if there was an issue.
async fn download(window: &tauri::Window, release: &DepRelease, dst: &str, event_name_prefix: &str) -> Result<()> {
    let client = Client::new();
    let mut response = client
        .get(&release.url)
        .send().await?;

    if !response.status().is_success() {
        return Err(SyncmiruError::DepsDownloadFailed);
    }

    let total_size = response.content_length().unwrap_or(1);
    window.emit(
        &format!("{}download-start", event_name_prefix),
        DownloadStart { url: &release.url, size: total_size }
    )?;

    let mut downloaded_size: u64 = 0;
    let mut file = File::create(syncmiru_data_dir()?.join(dst))?;

    let mut last_emit_time = Instant::now();
    let mut last_emit_downloaded_size: u64 = 0;
    while let Some(chunk) = response.chunk().await? {
        downloaded_size += chunk.len() as u64;
        file.write_all(&chunk)?;

        let elapsed_seconds = last_emit_time.elapsed().as_secs_f64() - Instant::now().elapsed().as_secs_f64();
        if elapsed_seconds >= 1.0 {
            let speed = (((downloaded_size - last_emit_downloaded_size) as f64) / elapsed_seconds).round() as u64;

            window.emit(
                &format!("{}download-progress", event_name_prefix),
                DownloadProgress { speed, received: downloaded_size }
            )?;

            last_emit_downloaded_size = downloaded_size;
            last_emit_time = Instant::now();
        }
    }
    window.emit(
        &format!("{}download-finished", event_name_prefix),
        { }
    )?;
    Ok(())
}


/// Represents the availability of dependencies, including their versions and management status.
#[derive(Serialize)]
pub struct DepsAvailable {
    /// Whether mpv is available
    mpv: bool,

    /// Whether yt-dlp is available
    yt_dlp: bool,

    /// Version of available mpv
    mpv_ver: String,

    /// Version of available yt-dlp
    yt_dlp_ver: String,

    /// Whether dependencies are managed by the application (`true`) or OS (`false`)
    managed: bool
}

impl DepsAvailable {

    /// Checks the system for available `mpv` and `yt-dlp` executables and their versions.
    ///
    /// Arguments:
    /// - `deps_managed: bool`: A flag indicating whether dependencies are managed by the application or not.
    ///
    /// Return:
    /// - `Result<Self>`: A struct representing whether the dependencies are available, their versions, and whether they are managed.
    pub fn from_params(deps_managed: bool) -> Result<Self> {
        let mut mpv = "mpv".to_string();
        let mut yt_dlp = "yt-dlp".to_string();
        if deps_managed {
            mpv = mpv_exe()?.to_str().context("mpv dir invalid")?.to_string();
            yt_dlp = yt_dlp_exe()?.to_str().context("yt-dlp dir invalid")?.to_string();
        }

        let mut mpv_res = false;
        let mut yt_dlp_res = false;
        let mut mpv_ver = "".to_string();
        let mut yt_dlp_ver = "".to_string();

        let mut mpv_c = Command::new(mpv);
        let mut mpv_cmd = mpv_c.arg("--version");

        cfg_if! {
            if #[cfg(target_family = "windows")] {
                mpv_cmd = mpv_cmd.creation_flags(constants::WIN32_CREATE_NO_WINDOW)
            }
        }
        let mpv_output_r = mpv_cmd.output();

        if let Ok(mpv_output) = mpv_output_r {
            let mpv_stdout_output = String::from_utf8_lossy(mpv_output.stdout.as_slice());
            let mpv_stdout_first = mpv_stdout_output
                .split_whitespace()
                .take(2)
                .collect::<Vec<&str>>()
                .join(" ");

            mpv_res = mpv_stdout_first.starts_with("mpv");
            if mpv_res {
                mpv_ver = mpv_stdout_first.split_whitespace().nth(1).unwrap().to_string();
            }
        }

        let mut yt_dlp_c = Command::new(yt_dlp);
        let mut yt_dlp_cmd = yt_dlp_c.arg("--version");

        cfg_if! {
            if #[cfg(target_family = "windows")] {
                yt_dlp_cmd = yt_dlp_cmd.creation_flags(constants::WIN32_CREATE_NO_WINDOW)
            }
        }
        let yt_dlp_output = yt_dlp_cmd.output();

        if let Ok(yt_dlp_output) = yt_dlp_output {
            let yt_dlp_stdout_output = String::from_utf8_lossy(yt_dlp_output.stdout.as_slice());
            let yt_dlp_version = yt_dlp_stdout_output
                .strip_suffix("\r\n")
                .or(yt_dlp_stdout_output.strip_suffix("\n"))
                .unwrap_or(yt_dlp_stdout_output.as_ref())
                .to_string();

            yt_dlp_res = yt_dlp_version.len() == 10;
            if yt_dlp_res {
                yt_dlp_ver = yt_dlp_version;
            }
        }

        Ok(Self { mpv: mpv_res, yt_dlp: yt_dlp_res, managed: deps_managed, mpv_ver, yt_dlp_ver })
    }

    /// Returns whether both `mpv` and `yt-dlp` are available and functional.
    ///
    /// Return:
    /// - `bool`: `true` if both dependencies are available and functional, otherwise `false`.
    pub fn all_available(&self) -> bool {
        self.mpv && self.yt_dlp
    }
}