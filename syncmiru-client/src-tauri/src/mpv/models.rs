//! This module contains structures used for managing media loading and user-specific playback settings,

use rust_decimal::Decimal;

/// A struct representing the information required to load media from a specific source.
#[derive(Debug, serde::Deserialize)]
pub struct LoadFromSource {
    /// URL address of the source
    pub source_url: String,

    /// JWT to access the file
    pub jwt: String,

    /// Playback speed to set
    pub playback_speed: Decimal
}


/// A struct representing the information needed to load media directly from a URL.
#[derive(Debug, serde::Deserialize)]
pub struct LoadFromUrl {
    /// URL address of the file to play
    pub url: String,

    /// Playback speed to set
    pub playback_speed: Decimal
}

/// A struct representing user-specific information regarding the loaded media.
#[derive(Debug, Copy, Clone, serde::Serialize)]
pub struct UserLoadedInfo {
    /// Loaded audio track
    pub aid: Option<u64>,

    /// Loaded subtitle track
    pub sid: Option<u64>,

    /// Whether audio track is synchronized
    pub audio_sync: bool,

    /// Whether subtitle track is synchronized
    pub sub_sync: bool
}