pub mod frontend;

use std::fmt::format;
use reqwest::Client;
use crate::error::SyncmiruError::ServiceCheckingFailed;
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
        return Err(ServiceCheckingFailed)
    }
    Ok(response.json().await?)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn service_status_test() {
        let s = service_status("http://127.0.0.1").await.unwrap();
        assert_eq!(s.reg_pub_allowed, false);
    }

}