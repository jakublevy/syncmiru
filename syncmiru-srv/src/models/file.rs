//! This module defines data structures and utilities for interacting with files
//! retrieved from configured file servers.

use chrono::Utc;
use serde::{Deserialize, Deserializer, Serialize};
use serde_repr::Serialize_repr;


/// Represents metadata for a file or directory.
///
/// This structure is designed to store detailed information about a file, including its
/// name, last modification time, type (file or directory), and size.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileInfo {
    /// The name of the file or directory
    pub name: String,

    /// The last modification time, deserialized from an RFC 1123 timestamp
    #[serde(deserialize_with = "deserialize_rfc1123")]
    pub mtime: chrono::DateTime<Utc>,

    /// The type of file (`File`, or `Directory`).
    #[serde(rename(deserialize = "type"))]
    pub file_type: FileType,

    /// The size of the file in bytes, or `None` if not applicable
    pub size: Option<u64>
}


/// Deserializes an RFC 1123 timestamp into a `chrono::DateTime<Utc>`.
///
/// This function is used to handle timestamps in file metadata that conform to the
/// RFC 1123 standard.
///
/// # Arguments
/// * `deserializer` (`D`): The deserializer instance provided by Serde.
///
/// # Returns
/// * `Result<chrono::DateTime<Utc>, D::Error>`: A `DateTime` object in UTC or an error if the
///   input string cannot be parsed.
fn deserialize_rfc1123<'de, D>(deserializer: D) -> Result<chrono::DateTime<Utc>, D::Error>
where
    D: Deserializer<'de>,
{
    let s: String = Deserialize::deserialize(deserializer)?;
    chrono::DateTime::parse_from_rfc2822(&s)
        .map(|dt| dt.with_timezone(&Utc))
        .map_err(serde::de::Error::custom)
}


/// Represents the type of file (`File`, or `Directory`).
#[derive(Debug, Clone, PartialEq, Serialize_repr, Deserialize)]
#[serde(rename_all(deserialize = "lowercase"))]
#[repr(u8)]
pub enum FileType {
    /// Regular file
    File = 0,

    /// Directory
    Directory = 1
}