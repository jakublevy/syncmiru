use serde::{Deserializer, Serializer};
use crate::config::Language::{Czech, English};
use crate::config::Theme::{Dark, Light, System};

pub mod utils;
pub mod appdata;
pub mod jwt;
pub mod frontend;

#[derive(Debug, Copy, Clone)]
pub enum Language {
    Czech,
    English,
}

impl Language {
    pub fn from(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "cs" => Czech,
            _ => English,
        }
    }
    pub fn as_str(&self) -> &'static str {
        match self {
            Czech => "cs",
            English => "en"
        }
    }
}

impl serde::Serialize for Language {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        serializer.serialize_str(self.as_str())
    }
}

impl<'de> serde::Deserialize<'de> for Language {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error> where D: Deserializer<'de> {
        let s = String::deserialize(deserializer)?;
        Ok(Language::from(s.as_str()))
    }
}

#[derive(Debug)]
pub enum Theme {
    Light,
    Dark,
    System,
}

impl Theme {
    pub fn from(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "light" => Light,
            "dark" => Dark,
            _ => System
        }
    }
    pub fn as_str(&self) -> &'static str {
        match self {
            Light => "light",
            Dark => "dark",
            System => "system"
        }
    }
}

impl From<tauri_plugin_theme::Theme> for Theme {
    fn from(value: tauri_plugin_theme::Theme) -> Self {
        match value {
            tauri_plugin_theme::Theme::Auto => Theme::System,
            tauri_plugin_theme::Theme::Light => Theme::Light,
            tauri_plugin_theme::Theme::Dark => Theme::Dark
        }
    }
}