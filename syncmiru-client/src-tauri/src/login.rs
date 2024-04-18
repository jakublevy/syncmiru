pub mod frontend;

use std::time::Duration;
use anyhow::{anyhow};
use reqwest::{Client};
use serde::{Deserialize, Serialize};
use crate::constants;
use crate::error::SyncmiruError;
use crate::result::Result;

#[derive(PartialEq)]
enum HttpMethod {
    Get, Post
}

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

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ServiceStatus {
    reg_pub_allowed: bool,
    wait_before_resend: i64
}

#[derive(Debug, Copy, Clone, Deserialize)]
pub struct BooleanResp {
    pub resp: bool,
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct RegData {
    username: String,
    displayname: String,
    email: String,
    password: String,
    captcha: String,
    reg_tkn: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TknEmail {
    pub tkn: String,
    pub email: String
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ForgottenPasswordChange {
    pub tkn: String,
    pub email: String,
    pub password: String,
    pub lang: String
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct LoginForm {
    email: String,
    password: String
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct NewLogin {
    email: String,
    password: String,
    os: String,
    device_name: String,
    hash: String
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct Jwt {
    jwt: String
}
