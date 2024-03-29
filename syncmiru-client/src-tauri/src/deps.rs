use std::cmp::min;
use std::fs::File;
use std::io;
use std::io::{Error, Write};
use std::ops::Index;
use anyhow::Context;
use reqwest::Client;
use roxmltree::Node;
use crate::constants;
use crate::error::SyncmiruError;
use crate::result::Result;

mod frontend;
pub mod utils;

pub struct DepRelease {
    url: String,
    version: String,
}

pub async fn latest_mpv_download_link() -> Result<DepRelease> {
    let mut api_url = constants::MPV_RELEASES_URL;
    if is_x86_feature_detected!("avx2") {
        api_url = constants::MPV_AVX2_RELEASES_URL;
    }
    let client = Client::new();
    let mut response = client.get(api_url).send().await?;
    let xml_raw = response.text().await?;
    let doc = roxmltree::Document::parse(xml_raw.as_str())?;
    let items = doc
        .descendants()
        .filter(|n|n.has_tag_name("item"))
        .take(1)
        .collect::<Vec<Node>>();
    if items.len() == 0 {
        return Err(SyncmiruError::XmlMissingTagError)
    }
    let item = &items[0];

    let links = item
        .descendants()
        .filter(|n|n.has_tag_name("link"))
        .take(1)
        .collect::<Vec<Node>>();
    if links.len() == 0 {
        return Err(SyncmiruError::XmlMissingTagError)
    }
    let link_node = &links[0];
    let link = link_node
        .text()
        .context("Link is missing")?;

    let paths = link
        .split("/")
        .collect::<Vec<&str>>();

    if paths.len() < 8 {
        return Err(SyncmiruError::VersionMissingUrl)
    }
    let filename_split = paths[7]
        .split("-")
        .collect::<Vec<&str>>();

    if filename_split.len() < 4 {
        return Err(SyncmiruError::VersionMissingUrl)
    }

    let version = filename_split[3];

    Ok(DepRelease{ url: link.to_string(), version: version.to_string() })
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
}