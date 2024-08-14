#[derive(Debug, serde::Deserialize)]
pub struct LoadFromSource {
    pub source_url: String,
    pub jwt: String
}