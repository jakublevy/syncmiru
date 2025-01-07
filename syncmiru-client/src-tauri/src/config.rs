//! This module defines the configuration-related types and functionality for the application.

use serde::{Deserialize, Deserializer, Serializer};
use crate::config::Language::{Czech, English};
use crate::config::Theme::{Dark, Light, Auto};

pub mod utils;
pub mod appdata;
pub mod jwt;
pub mod frontend;


/// Enum representing the supported languages for the application.
#[derive(Debug, Copy, Clone)]
pub enum Language {
    Czech,
    English,
}

impl Language {

    /// Creates a `Language` enum from a string representation.
    /// /// # Returns
    /// - `Language::Czech` for `"cs"`.
    /// - `Language::English` for any other value.
    pub fn from(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "cs" => Czech,
            _ => English,
        }
    }

    /// Returns the string representation of the `Language` enum.
    ///
    /// # Returns
    /// - `"cs"` for `Language::Czech`.
    /// - `"en"` for `Language::English`.
    pub fn as_str(&self) -> &'static str {
        match self {
            Czech => "cs",
            English => "en"
        }
    }
}

/// Implementation of serialization capability for `Language`
impl serde::Serialize for Language {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        serializer.serialize_str(self.as_str())
    }
}


/// Implementation of deserialization capability for `Language`
impl<'de> serde::Deserialize<'de> for Language {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error> where D: Deserializer<'de> {
        let s = String::deserialize(deserializer)?;
        Ok(Language::from(s.as_str()))
    }
}

/// Enum representing the available themes for the application.
///
/// The application supports three visual themes:
/// - `Light`: A light-colored theme.
/// - `Dark`: A dark-colored theme.
/// - `Auto`: Automatically adjusts based on system preferences.
#[derive(Debug, Copy, Clone, PartialEq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Light,
    Dark,
    Auto,
}

impl Theme {

    /// Creates a `Theme` enum from a string representation.
    ///
    /// # Arguments
    /// - `s`: A string slice representing the theme name (e.g., `"light"`, `"dark"`, or `"auto"`).
    ///
    /// # Returns
    /// - The corresponding `Theme` variant.
    /// - Defaults to `Theme::Auto` for unknown values.
    pub fn from(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "light" => Light,
            "dark" => Dark,
            _ => Auto
        }
    }

    /// Returns the string representation of the `Theme` enum.
    ///
    /// # Returns
    /// - `"light"` for `Theme::Light`.
    /// - `"dark"` for `Theme::Dark`.
    /// - `"auto"` for `Theme::Auto`.
    pub fn as_str(&self) -> &'static str {
        match self {
            Light => "light",
            Dark => "dark",
            Auto => "auto"
        }
    }
}

/// This implementation allows seamless interoperability between the tauri_plugin_theme
/// representation and the application's internal theme enumeration.
impl From<tauri_plugin_theme::Theme> for Theme {
    fn from(value: tauri_plugin_theme::Theme) -> Self {
        match value {
            tauri_plugin_theme::Theme::Auto => Theme::Auto,
            tauri_plugin_theme::Theme::Light => Theme::Light,
            tauri_plugin_theme::Theme::Dark => Theme::Dark
        }
    }
}

/// This implementation facilitates compatibility between the application's
/// theme settings and Tauri's theme management system.
impl From<Theme> for tauri::Theme {
    fn from(value: Theme) -> Self {
        match value {
            Theme::Light => tauri::Theme::Light,
            Theme::Dark => tauri::Theme::Dark,
            Theme::Auto => tauri::Theme::Light
        }
    }
}
