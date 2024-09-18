use std::collections::HashSet;
use std::time::{Duration, SystemTime};
use anyhow::anyhow;
use josekit::jws::JwsHeader;
use josekit::jwt::JwtPayload;
use reqwest::Client;
use serde::{Deserialize, Deserializer, Serialize};
use crate::{constants, Result};
use crate::error::SyncmiruError;
use urlencoding::encode;
use crate::config::{JwtSigner, Source};
use crate::models::file::{FileInfo, FileType};
use crate::trait_ext::DurationExt;

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
    path: &str,
    allowed_extensions: &Option<HashSet<String>>
) -> Result<bool> {
    let (p, f) = split_on_last_occurrence(path, '/').unwrap();
    let files_r = list(root_url, jwt, p).await;
    if files_r.is_err() {
        return Ok(false)
    }
    let files = files_r.unwrap();
    for file in &files {
        if file.name == f
        && file.file_type == FileType::File
        && allowed_extensions.is_some() && allowed_extensions.as_ref().unwrap().contains(extract_extension(&file.name)) {
            return Ok(true)
        }
    }
    Ok(false)
}

pub async fn gen_access_jwt(
    source: &Source,
    path: &str
) -> Result<String> {
    let mut header = JwsHeader::new();
    header.set_token_type("JWT");

    let mut payload = JwtPayload::new();
    payload.set_expires_at(&(SystemTime::now() + Duration::from_hours(12)));

    let file_value = serde_json::from_str(&format!("\"{}\"", path))?;
    payload.set_claim("file", Some(file_value))?;

    let signer = source.jwt_signer()?;
    header.set_algorithm(signer.algorithm().name());
    let signed = josekit::jwt::encode_with_signer(&payload, &header, &*signer)?;
    Ok(signed)
}

pub fn extract_extension(path: &str) -> &str {
    path.split(".").last().unwrap_or("")
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
            assert_eq!(1,1);
        }
        else {
            assert_eq!(1,2)
        }
    }

    #[tokio::test]
    async fn f_exists_test() {
        let extensions = vec!["avi".to_string(), "m4a".to_string(), "mkv".to_string(), "mov".to_string(), "mp4".to_string(), "vob".to_string(), "webm".to_string(), "wmv".to_string()];
        let res = f_exists(
            "https://kodi.levy.cx/syncmiru-server/?dir=",
            "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZWQiOjE3MTg2MzE0Njh9.8kkgmQ_5HTUFqiyrFR_1ZYqSpzK0sg-7JqmI-fi4byBMLzyE5OFY5rqlN5y6aqmR0yJ4u-y0FjL2alo2j8OuVA",
            "/anime/MF Ghost",
            extensions.as_ref()
        ).await;
        assert!(res.unwrap())
    }
}