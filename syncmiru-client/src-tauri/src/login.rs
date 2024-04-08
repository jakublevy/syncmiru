pub mod frontend;

use reqwest::Client;
use serde::{Deserialize, Serialize};
use crate::error::SyncmiruError::HttpResponseFailed;
use crate::result::Result;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ServiceStatus {
    reg_pub_allowed: bool
}

async fn service_status(home_url: &str) -> Result<ServiceStatus> {
    let service_url = home_url.to_string() + "/service";
    let client = Client::new();
    let response = client.get(service_url).send().await?;
    if !response.status().is_success() {
        return Err(HttpResponseFailed)
    }
    Ok(response.json().await?)
}

#[derive(Debug, Copy, Clone, Deserialize)]
pub struct ResourceUnique {
    pub code: YN,
}

#[derive(serde_repr::Serialize_repr, serde_repr::Deserialize_repr, Debug, Copy, Clone, PartialEq)]
#[repr(u8)]
pub enum YN {
    Yes,
    No
}

impl From<YN> for bool {
    fn from(value: YN) -> Self {
        match value {
            YN::No => false,
            YN::Yes => true
        }
    }
}

async fn username_unique(home_url: &str, username: &str) -> Result<bool> {
    let url = home_url.to_string() + "/username-unique";
    let payload = serde_json::json!({"username": username});
    let client = Client::new();
    let response = client
        .get(url)
        .json(&payload)
        .send().await?;
    if !response.status().is_success() {
        return Err(HttpResponseFailed)
    }
    let resource_unique: ResourceUnique = response.json().await?;
    Ok(resource_unique.code.into())
}

async fn email_unique(home_url: &str, email: &str) -> Result<bool> {
    let url = home_url.to_string() + "/email-unique";
    let payload = serde_json::json!({"email": email});
    let client = Client::new();
    let response = client
        .get(url)
        .json(&payload)
        .send().await?;
    if !response.status().is_success() {
        return Err(HttpResponseFailed)
    }
    let resource_unique: ResourceUnique = response.json().await?;
    Ok(resource_unique.code.into())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn service_status_test() {
        let s = service_status("http://127.0.0.1").await.unwrap();
        assert_eq!(s.reg_pub_allowed, false);
    }

    #[tokio::test]
    async fn username_unique_test() {
        let b = username_unique("http://127.0.0.1", "sunidd").await.unwrap();
        assert_eq!(YN::Yes, b);
    }

    #[tokio::test]
    async fn email_unique_test() {
        let b = email_unique("http://127.0.0.1", "ahoj@testtest.cz").await.unwrap();
        assert_eq!(YN::Yes, b);
    }
}