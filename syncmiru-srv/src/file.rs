use std::time::Duration;
use anyhow::anyhow;
use reqwest::Client;
use serde::{Deserialize, Deserializer, Serialize};
use crate::{constants, Result};
use crate::error::SyncmiruError;
use urlencoding::encode;
use crate::models::file::FileInfo;

pub async fn list(
    root_url: &str,
    jwt: &str,
    path: &str
) -> Result<Vec<FileInfo>> {
    let encoded_path = encode(path).into_owned();
    let client = Client::new()
        .get(&format!("{}{}", root_url, encoded_path))
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

pub async fn f_exists(
    root_url: &str,
    jwt: &str,
    path: &str
) -> Result<bool> {
    let (p, f) = split_on_last_occurrence(path, '/').unwrap();
    let files_r = list(root_url, jwt, p).await;
    if files_r.is_err() {
        return Ok(false)
    }
    let files = files_r.unwrap();
    for file in &files {
        if file.name == f {
            return Ok(true)
        }
    }
    Ok(false)
}

fn split_on_last_occurrence(s: &str, delimiter: char) -> Option<(&str, &str)> {
    let mut parts = s.rsplitn(2, delimiter);
    let second_part = parts.next()?;
    let first_part = parts.next().unwrap_or("");
    Some((first_part, second_part))
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

    #[tokio::test]
    async fn f_exists_test() {
        let res = f_exists(
            "https://kodi.levy.cx/syncmiru-server/?dir=",
            "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZWQiOjE3MTg2MzE0Njh9.8kkgmQ_5HTUFqiyrFR_1ZYqSpzK0sg-7JqmI-fi4byBMLzyE5OFY5rqlN5y6aqmR0yJ4u-y0FjL2alo2j8OuVA",
            "/anime/MF Ghost"
        ).await;
        assert!(res.unwrap())
    }
}