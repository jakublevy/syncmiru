use chrono::Utc;
use serde::{Deserialize, Deserializer, Serialize};
use serde_repr::Serialize_repr;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,

    #[serde(deserialize_with = "deserialize_rfc1123")]
    pub mtime: chrono::DateTime<Utc>,

    #[serde(rename(deserialize = "type"))]
    pub file_type: FileType,

    pub size: Option<u64>
}

fn deserialize_rfc1123<'de, D>(deserializer: D) -> Result<chrono::DateTime<Utc>, D::Error>
where
    D: Deserializer<'de>,
{
    let s: String = Deserialize::deserialize(deserializer)?;
    chrono::DateTime::parse_from_rfc2822(&s)
        .map(|dt| dt.with_timezone(&Utc))
        .map_err(serde::de::Error::custom)
}

#[derive(Debug, Clone, PartialEq, Serialize_repr, Deserialize)]
#[serde(rename_all(deserialize = "lowercase"))]
#[repr(u8)]
pub enum FileType {
    File = 0,
    Directory = 1
}