//! This module provides functionality for interacting with the configured file servers.
//! It supports listing files, checking the existence of specific files, and generating JSON Web Tokens (JWTs)
//! for secure file access.

use std::collections::HashSet;
use std::time::{Duration, SystemTime};
use anyhow::anyhow;
use josekit::jws::JwsHeader;
use josekit::jwt::JwtPayload;
use reqwest::Client;
use crate::{constants, Result};
use crate::error::SyncmiruError;
use urlencoding::encode;
use crate::config::{JwtSigner, Source};
use crate::models::file::{FileInfo, FileType};


/// Lists files from a specified path on a remote file server.
///
/// # Arguments
/// - `root_url`: The base URL of the file server.
/// - `jwt`: The JWT token used for authentication.
/// - `path`: The path on the file server to list files from.
///
/// # Returns
/// A vector of `FileInfo` objects containing details about the files.
///
/// # Errors
/// Returns an error if the HTTP request fails or the server returns an unsuccessful status.
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


/// Checks if a specific file exists in a given path on the file server.
///
/// # Arguments
/// - `root_url`: The base URL of the file server.
/// - `jwt`: The JWT token used for authentication.
/// - `path`: The path to the file.
/// - `allowed_extensions`: An optional set of allowed file extensions to filter files.
///
/// # Returns
/// `true` if the file exists and meets the criteria, otherwise `false`.
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
    let files = files_r?;
    for file in &files {
        if file.name == f
        && file.file_type == FileType::File
        && allowed_extensions.is_some() && allowed_extensions.as_ref().unwrap().contains(extract_extension(&file.name)) {
            return Ok(true)
        }
    }
    Ok(false)
}


/// Generates a JWT for accessing a specific file.
///
/// # Arguments
/// - `source`: The source configuration containing the JWT signer.
/// - `path`: The path to the file for which the token is generated.
///
/// # Returns
/// A signed JWT as a `String`.
///
/// # Errors
/// Returns an error if the JWT signing process fails.
pub async fn gen_access_jwt(
    source: &Source,
    path: &str
) -> Result<String> {
    let mut header = JwsHeader::new();
    header.set_token_type("JWT");

    let mut payload = JwtPayload::new();
    payload.set_expires_at(&(SystemTime::now() + Duration::from_secs(12 * 3600)));

    let file_value = serde_json::from_str(&format!("\"{}\"", path))?;
    payload.set_claim("file", Some(file_value))?;

    let signer = source.jwt_signer()?;
    header.set_algorithm(signer.algorithm().name());
    let signed = josekit::jwt::encode_with_signer(&payload, &header, &*signer)?;
    Ok(signed)
}


/// Extracts the file extension from a given file path.
///
/// # Arguments
/// - `path`: The file path as a string slice.
///
/// # Returns
/// The file extension as a string slice. Returns an empty string if no extension is found.
fn extract_extension(path: &str) -> &str {
    path.split(".").last().unwrap_or("")
}


/// Splits a string into two parts based on the last occurrence of a delimiter.
///
/// # Arguments
/// - `s`: The input string.
/// - `delimiter`: The character used as the delimiter.
///
/// # Returns
/// A tuple containing the two parts of the string. If the delimiter is not found,
/// the first part is an empty string, and the second part is the input string.
fn split_on_last_occurrence(s: &str, delimiter: char) -> Option<(&str, &str)> {
    let mut parts = s.rsplitn(2, delimiter);
    let second_part = parts.next()?;
    let first_part = parts.next().unwrap_or("");
    Some((first_part, second_part))
}