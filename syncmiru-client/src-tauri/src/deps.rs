use std::cmp::min;
use std::fs::File;
use std::{fs, io};
use std::io::{Error, Write};
use std::ops::Index;
use std::path::Path;
use std::process::Command;
use std::sync::RwLock;
use std::time::Instant;
use anyhow::Context;
use reqwest::Client;
use roxmltree::Node;
use serde::Serialize;
use tauri::Manager;
use zip::ZipArchive;
use crate::config::appdata::{AppData, write_config};
use crate::constants;
use crate::deps::frontend::{DownloadProgressFrontend, DownloadStartFrontend};
use crate::deps::utils::{mpv_exe, yt_dlp_exe};
use crate::error::SyncmiruError;
use crate::files::syncmiru_data_dir;
use crate::result::Result;

pub mod frontend;
pub mod utils;

struct DepRelease {
    url: String,
    version: String,
}

async fn latest_mpv_download_link() -> Result<DepRelease> {
    let mut api_url = constants::MPV_RELEASES_URL;
    if is_x86_feature_detected!("avx2") {
        api_url = constants::MPV_AVX2_RELEASES_URL;
    }
    let client = Client::new();
    let mut response = client.get(api_url).send().await?;
    let xml_raw = response.text().await?;
    let doc = roxmltree::Document::parse(xml_raw.as_str())?;
    let item = doc
        .descendants()
        .filter(|n|n.has_tag_name("item"))
        .take(1)
        .next()
        .context("xml missing tag")?;

    let link_node = item
        .descendants()
        .filter(|n|n.has_tag_name("link"))
        .take(1)
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

async fn download(window: &tauri::Window, release: &DepRelease, dst: &str, event_name_prefix: &str) -> Result<()> {
    let client = Client::new();
    let mut response = client.get(&release.url).send().await?;

    if !response.status().is_success() {
        return Err(SyncmiruError::DepsDownloadFailed);
    }

    let total_size = response.content_length().unwrap_or(1);
    window.emit(
        &format!("{}download-start", event_name_prefix),
        DownloadStartFrontend { url: &release.url, size: total_size }
    )?;

    let mut downloaded_size: u64 = 0;
    let mut file = File::create(syncmiru_data_dir()?.join(dst))?;

    let mut last_emit_time = Instant::now();
    let mut last_print_downloaded_size: u64 = 0;
    while let Some(chunk) = response.chunk().await? {
        downloaded_size += chunk.len() as u64;
        file.write_all(&chunk)?;

        let elapsed_seconds = last_emit_time.elapsed().as_secs_f64() - Instant::now().elapsed().as_secs_f64();
        if elapsed_seconds >= 1.0 {
            let speed = (((downloaded_size - last_print_downloaded_size) as f64) / elapsed_seconds).round() as u64;

            window.emit(
                &format!("{}download-progress", event_name_prefix),
                DownloadProgressFrontend { speed, received: downloaded_size }
            )?;

            last_print_downloaded_size = downloaded_size;
            last_emit_time = Instant::now();
        }
    }
    window.emit(
        &format!("{}download-finished", event_name_prefix),
        { }
    )?;
    Ok(())
}

#[derive(Serialize)]
pub struct DepsAvailable {
    mpv: bool,
    yt_dlp: bool
}

impl DepsAvailable {
    pub fn from_params(deps_managed: bool) -> Result<Self> {
        let mut mpv = "mpv".to_string();
        let mut yt_dlp = "yt-dlp".to_string();
        if deps_managed {
            mpv = mpv_exe()?.to_str().context("mpv dir invalid")?.to_string();
            yt_dlp = yt_dlp_exe()?.to_str().context("yt-dlp dir invalid")?.to_string();
        }

        let mut mpv_res = false;
        let mut yt_dlp_res = false;

        let mpv_output_r = Command::new(mpv)
            .arg("--version")
            .output();
        if let Ok(mpv_output) = mpv_output_r {
            let mpv_stdout_output = String::from_utf8_lossy(mpv_output.stdout.as_slice());
            let mpv_stdout_first = mpv_stdout_output
                .split_whitespace()
                .take(1)
                .collect::<String>();

            mpv_res = mpv_stdout_first == "mpv"
        }

        let yt_dlp_output = Command::new(yt_dlp)
            .arg("--version")
            .output();
        if let Ok(yt_dlp_output) = yt_dlp_output {
            let yt_dlp_stdout_output = String::from_utf8_lossy(yt_dlp_output.stdout.as_slice());
            let yt_dlp_version = yt_dlp_stdout_output
                .strip_suffix("\r\n")
                .or(yt_dlp_stdout_output.strip_suffix("\n"))
                .unwrap_or(yt_dlp_stdout_output.as_ref())
                .to_string();

            yt_dlp_res = yt_dlp_version.len() == 10;
        }

        Ok(DepsAvailable { mpv: mpv_res, yt_dlp: yt_dlp_res })
    }
    pub fn all_available(&self) -> bool {
        self.mpv && self.yt_dlp
    }
}



#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn latest_mpv_url_test() {
        let mpv_release = latest_mpv_download_link().await.unwrap();
        assert_eq!(mpv_release.url, "https://sourceforge.net/projects/mpv-player-windows/files/64bit-v3/mpv-x86_64-v3-20240317-git-3afcaeb.7z/download");
        assert_eq!(mpv_release.version, "20240317");
    }

    #[tokio::test]
    async fn latest_yt_dlp_url_test() {
        let yt_dlp_release = latest_yt_dlp_download_link().await.unwrap();
        assert_eq!(yt_dlp_release.url, "https://github.com/yt-dlp/yt-dlp/releases/download/2024.03.10/yt-dlp_win.zip");
        assert_eq!(yt_dlp_release.version, "2024.03.10");
    }

    #[test]
    fn test_dep_state() {
        let s = DepsAvailable::from_params(false).unwrap();
        assert_eq!(s.mpv, true);
        assert_eq!(s.yt_dlp, true);
        assert_eq!(s.all_available(), true);
    }

    #[test]
    fn test_dep_state2() {
        let s = DepsAvailable::from_params(true).unwrap();
        assert_eq!(s.mpv, false);
        assert_eq!(s.yt_dlp, false);
        assert_eq!(s.all_available(), false);
    }
}