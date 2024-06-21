use std::time::Duration;
use anyhow::anyhow;
use chrono::Utc;
use reqwest::Client;
use serde::{Deserialize, Deserializer, Serialize};
use serde_repr::Serialize_repr;
use crate::{constants, Result};
use crate::error::SyncmiruError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,

    #[serde(deserialize_with = "deserialize_rfc1123")]
    pub mtime: chrono::DateTime<Utc>,

    #[serde(rename(deserialize = "type"))]
    pub file_type: FileType,

    pub size: Option<u64>
}

fn deserialize_rfc1123<'de, D>(deserializer: D) -> std::result::Result<chrono::DateTime<Utc>, D::Error>
where
    D: Deserializer<'de>,
{
    let s: String = Deserialize::deserialize(deserializer)?;
    chrono::DateTime::parse_from_rfc2822(&s)
        .map(|dt| dt.with_timezone(&Utc))
        .map_err(serde::de::Error::custom)
}

#[derive(Debug, Clone, PartialEq, Serialize_repr, Deserialize)]
#[serde(rename_all(deserialize = "lowercase"))]
#[repr(u8)]
pub enum FileType {
    File = 0,
    Directory = 1
}

pub async fn list(
    root_url: &str,
    jwt: &str,
    path: &str
) -> Result<Vec<FileInfo>> {
    let client = Client::new()
        .get(format!("{}{}", root_url, path))
        .timeout(Duration::from_secs(constants::HTTP_TIMEOUT))
        .header(reqwest::header::AUTHORIZATION, format!("Bearer {}", jwt));

    let response = client
        .send()
        .await
        .map_err(reqwest::Error::from)?;

    if !response.status().is_success() {
        return Err(SyncmiruError::from(anyhow!(response.text().await?)))
    }

    let files_info = response.json::<Vec<FileInfo>>().await?;
    Ok(files_info)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn list_root() {
        let files_opt = list(
            "https://kodi.levy.cx/syncmiru-server/?dir=",
            "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZWQiOjE3MTg2MzE0Njh9.8kkgmQ_5HTUFqiyrFR_1ZYqSpzK0sg-7JqmI-fi4byBMLzyE5OFY5rqlN5y6aqmR0yJ4u-y0FjL2alo2j8OuVA",
            "/anime/Initial D"
        ).await;
        if let Ok(files) = files_opt {
            println!("{files:?}");
            assert_eq!(1,1);
        }
        else {
            assert_eq!(1,2)
        }
    }
}