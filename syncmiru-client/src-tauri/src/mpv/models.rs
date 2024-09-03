use rust_decimal::Decimal;

#[derive(Debug, serde::Deserialize)]
pub struct LoadFromSource {
    pub source_url: String,
    pub jwt: String,
    pub playback_speed: Decimal
}

#[derive(Debug, serde::Deserialize)]
pub struct LoadFromUrl {
    pub url: String,
    pub playback_speed: Decimal
}

#[derive(Debug, Copy, Clone, serde::Serialize)]
pub struct UserLoadedInfo {
    pub aid: Option<u64>,
    pub sid: Option<u64>,
    pub audio_sync: bool,
    pub sub_sync: bool
}