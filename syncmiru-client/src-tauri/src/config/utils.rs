use std::fs;
use std::path::PathBuf;
use anyhow::Context;

use crate::config::Language;
use crate::constants;
use crate::result::Result;

pub(super) fn ini_str_to_bool(str: &str, default: bool) -> bool {
    let s = str.trim();
    if s == "1" || s.to_lowercase() == "true" {
        true
    }
    else if s == "0" || s.to_lowercase() == "false" {
        false
    }
    else {
        default
    }
}

pub(super) fn ini_bool_to_string(b: bool) -> String {
    if b {
        "1".to_string()
    }
    else {
        "0".to_string()
    }
}

pub(super) fn get_preferred_locale() -> Language {
    let locales = sys_locale::get_locales();
    for locale in locales {
        if locale.starts_with("cs") {
            return Language::Czech
        }
        if locale.starts_with("cs") {
            return Language::English
        }
    }
    Language::English
}

pub fn syncmiru_data_dir() -> Result<PathBuf> {
    Ok(dirs::data_dir().context(t!("data-dir-panic"))?.join(constants::APP_NAME))
    //dirs::data_dir().expect(t!("data-dir-panic").as_ref()).join(constants::APP_NAME)
}

pub(super) fn syncmiru_config_dir() -> Result<PathBuf> {
    Ok(dirs::config_dir().context(t!("config-dir-panic"))?.join(constants::APP_NAME))
    //dirs::config_dir().expect(t!("config-dir-panic").as_ref()).join(constants::APP_NAME)
}

pub(super) fn syncmiru_config_ini() -> Result<PathBuf> {
    Ok(syncmiru_config_dir()?.join(constants::CONFIG_INI_FILE_NAME))
}

pub fn delete_tmp() -> Result<()> {
    // todo: call on start and closing
    let data_dir = syncmiru_data_dir()?;
    for entry in fs::read_dir(data_dir)? {
        let entry = entry?;
        if let Some(filename) = entry.file_name().to_str() {
            if filename.starts_with("_") {
                let path = entry.path();
                if path.is_dir() {
                    fs::remove_dir_all(path)?;
                }
                else {
                    fs::remove_file(path)?;
                }
            }
        }
    }
    Ok(())
}