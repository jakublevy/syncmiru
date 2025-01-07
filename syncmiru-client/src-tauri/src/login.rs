//! This module contains functions and data structures for handling user login, registration,
//! and authentication-related operations.

pub mod frontend;

use std::time::Duration;
use anyhow::{anyhow};
use reqwest::{Client};
use serde::{Deserialize};
use crate::constants;
use crate::error::SyncmiruError;
use crate::result::Result;

#[derive(PartialEq)]
enum HttpMethod {
    Get, Post
}

/// Makes an HTTP request (GET or POST) to the specified URL with optional payload.
///
/// # Arguments
/// * `url` - The URL to send the request to.
/// * `method` - The HTTP method to use (GET or POST).
/// * `payload_opt` - Optional JSON payload for POST requests.
///
/// # Returns
/// - `Result<reqwest::Response>` containing the response if successful.
///
/// # Errors
/// - Returns an error if the request fails or the server returns a non-success status code.
async fn req(
    url: &str,
    method: HttpMethod,
    payload_opt: Option<serde_json::Value>
) -> Result<reqwest::Response> {

    let mut client = Client::new().get("");
    match method {
        HttpMethod::Get => { client = Client::new().get(url) }
        HttpMethod::Post => { client = Client::new().post(url) }
    }
    client = client.timeout(Duration::from_secs(constants::HTTP_TIMEOUT));

    if let Some(payload) = payload_opt {
        client = client.json(&payload);
    }

    let response = client
        .send()
        .await
        .map_err(reqwest::Error::from)?;

    if !response.status().is_success() {
        return Err(SyncmiruError::from(anyhow!(response.text().await?)))
    }
    Ok(response)
}

/// Makes an HTTP request and parses the JSON response.
///
/// # Arguments
/// * `url` - The URL to send the request to.
/// * `method` - The HTTP method to use (GET or POST).
/// * `payload_opt` - Optional JSON payload for POST requests.
///
/// # Returns
/// - `Result<serde_json::Value>` containing the parsed JSON response if successful.
///
/// # Errors
/// - Returns an error if the request or response parsing fails.
async fn req_json(
    url: &str,
    method: HttpMethod,
    payload_opt: Option<serde_json::Value>
) -> Result<serde_json::Value> {
    let ret = req(
        url,
        method,
        payload_opt
    ).await?;
    Ok(ret.json().await?)
}

/// Represents the service status including whether registration is allowed and the wait time
/// before allowing the next resend attempt.
#[derive(serde::Serialize, serde::Deserialize)]
pub struct ServiceStatus {
    reg_pub_allowed: bool,
    wait_before_resend: i64
}

/// Represents a boolean response from an API (e.g., success or failure).
#[derive(Debug, Copy, Clone, Deserialize)]
pub struct BooleanResp {
    pub resp: bool,
}

/// Contains the registration data for a new user.
#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct RegData {
    username: String,
    displayname: String,
    email: String,
    password: String,
    captcha: String,
    reg_tkn: Option<String>,
}

/// Token and email pair, used for recovering lost password.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TknEmail {
    pub tkn: String,
    pub email: String
}

/// Represents the data for changing a forgotten password.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ForgottenPasswordChange {
    pub tkn: String,
    pub email: String,
    pub password: String,
    pub lang: String
}

/// Contains the login form data for user login.
#[derive(Debug, Clone, serde::Deserialize)]
pub struct LoginForm {
    email: String,
    password: String
}

/// Contains the data required for a new login (includes system information).
#[derive(Debug, Clone, serde::Serialize)]
pub struct NewLogin {
    email: String,
    password: String,
    os: String,
    device_name: String,
    hwid_hash: String
}

/// Represents a JWT used for authentication.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Jwt {
    jwt: String
}

/// Contains a token.  This structure is used for token validation.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Tkn {
    pub tkn: String,
}