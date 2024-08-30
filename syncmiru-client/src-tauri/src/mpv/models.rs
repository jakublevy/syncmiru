#[derive(Debug, serde::Deserialize)]
pub struct LoadFromSource {
    pub source_url: String,
    pub jwt: String
}

#[derive(Debug, Copy, Clone, serde::Serialize)]
pub struct UserLoadedInfo {
    pub aid: Option<u64>,
    pub sid: Option<u64>,
    pub audio_sync: bool,
    pub sub_sync: bool
}