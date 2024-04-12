pub mod frontend;

use std::time::Duration;
use anyhow::{anyhow, bail};
use reqwest::{Client, ClientBuilder};
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

// async fn send_registration(home_url: &str, data: &RegData) -> Result<()> {
//     let url = home_url.to_string() + "/register";
//     let response = Client::new()
//         .post(url)
//         .timeout(Duration::from_secs(constants::HTTP_TIMEOUT))
//         .json(data)
//         .send().await
//         .map_err(reqwest::Error::from)?;
//     if !response.status().is_success() {
//         return Err(SyncmiruError::from(anyhow!(response.text().await?)))
//     }
//     Ok(())
// }

// async fn req_verification_email(home_url: &str, email: &str, lang: &str) -> Result<()> {
//     let url = home_url.to_string() + "/email-verify-send";
//     let payload = serde_json::json!({"email": email, "lang": lang});
//     let response = Client::new()
//         .post(url)
//         .timeout(Duration::from_secs(constants::HTTP_TIMEOUT))
//         .json(&payload)
//         .send().await
//         .map_err(reqwest::Error::from)?;
//     if !response.status().is_success() {
//         return Err(SyncmiruError::from(anyhow!(response.text().await?)))
//     }
//     Ok(())
// }

// #[cfg(test)]
// mod tests {
//     use super::*;
//     #[tokio::test]
//     async fn service_status_test() {
//         let s = get_service_status("http://127.0.0.1").await.unwrap();
//         assert_eq!(s.reg_pub_allowed, false);
//     }
//
//     #[tokio::test]
//     async fn username_unique_test() {
//         let b = get_username_unique("http://127.0.0.1", "sunidd").await.unwrap();
//         assert_eq!(true, b);
//     }
//
//     #[tokio::test]
//     async fn email_unique_test() {
//         let b = email_bool_check("http://127.0.0.1", "ahoj@testtest.cz", "/email-unique").await.unwrap();
//         assert_eq!(true, b);
//     }
//
//     #[tokio::test]
//     async fn verified_test() {
//         let b = email_bool_check("http://127.0.0.1", "ahoj@testtest.cz", "/email-verified").await.unwrap();
//         assert_eq!(false, b);
//     }
// }