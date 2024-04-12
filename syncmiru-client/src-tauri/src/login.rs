pub mod frontend;

use std::time::Duration;
use anyhow::{anyhow, bail};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use crate::constants;
use crate::error::SyncmiruError;
use crate::error::SyncmiruError::HttpResponseFailed;
use crate::result::Result;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ServiceStatus {
    reg_pub_allowed: bool,
    wait_before_resend: i64
}

async fn get_service_status(home_url: &str) -> Result<ServiceStatus> {
    let service_url = home_url.to_string() + "/service";
    let client = Client::new();
    let response = client
        .get(service_url)
        .timeout(Duration::from_secs(constants::HTTP_TIMEOUT))
        .send()
        .await?;
    if !response.status().is_success() {
        return Err(HttpResponseFailed)
    }
    Ok(response.json().await?)
}

#[derive(Debug, Copy, Clone, Deserialize)]
pub struct BooleanResp {
    pub resp: bool,
}

async fn get_username_unique(home_url: &str, username: &str) -> Result<bool> {
    let url = home_url.to_string() + "/username-unique";
    let payload = serde_json::json!({"username": username});
    let response = Client::new()
        .get(url)
        .timeout(Duration::from_secs(constants::HTTP_TIMEOUT))
        .json(&payload)
        .send().await?;
    if !response.status().is_success() {
        return Err(HttpResponseFailed)
    }
    let resource_unique: BooleanResp = response.json().await?;
    Ok(resource_unique.resp)
}

async fn email_bool_check(home_url: &str, email: &str, url_req: &str) -> Result<bool> {
    let url = home_url.to_string() + url_req;
    let payload = serde_json::json!({"email": email});
    let response = Client::new()
        .get(url)
        .timeout(Duration::from_secs(constants::HTTP_TIMEOUT))
        .json(&payload)
        .send().await?;
    if !response.status().is_success() {
        return Err(HttpResponseFailed)
    }
    let resource_unique: BooleanResp = response.json().await?;
    Ok(resource_unique.resp)
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

async fn send_registration(home_url: &str, data: &RegData) -> Result<()> {
    let url = home_url.to_string() + "/register";
    let response = Client::new()
        .post(url)
        .timeout(Duration::from_secs(constants::HTTP_TIMEOUT))
        .json(data)
        .send().await
        .map_err(reqwest::Error::from)?;
    if !response.status().is_success() {
        return Err(SyncmiruError::from(anyhow!(response.text().await?)))
    }
    Ok(())
}

async fn req_verification_email(home_url: &str, email: &str, lang: &str) -> Result<()> {
    let url = home_url.to_string() + "/email-verify-send";
    let payload = serde_json::json!({"email": email, "lang": lang});
    let response = Client::new()
        .post(url)
        .timeout(Duration::from_secs(constants::HTTP_TIMEOUT))
        .json(&payload)
        .send().await
        .map_err(reqwest::Error::from)?;
    if !response.status().is_success() {
        return Err(SyncmiruError::from(anyhow!(response.text().await?)))
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn service_status_test() {
        let s = get_service_status("http://127.0.0.1").await.unwrap();
        assert_eq!(s.reg_pub_allowed, false);
    }

    #[tokio::test]
    async fn username_unique_test() {
        let b = get_username_unique("http://127.0.0.1", "sunidd").await.unwrap();
        assert_eq!(true, b);
    }

    #[tokio::test]
    async fn email_unique_test() {
        let b = email_bool_check("http://127.0.0.1", "ahoj@testtest.cz", "/email-unique").await.unwrap();
        assert_eq!(true, b);
    }

    #[tokio::test]
    async fn verified_test() {
        let b = email_bool_check("http://127.0.0.1", "ahoj@testtest.cz", "/email-verified").await.unwrap();
        assert_eq!(false, b);
    }
}