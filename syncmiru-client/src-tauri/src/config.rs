use serde::{Deserializer, Serializer};
use crate::config::Language::{Czech, English};

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
