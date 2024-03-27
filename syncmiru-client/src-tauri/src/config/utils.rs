use std::path::PathBuf;

use crate::config::Language;
use crate::constants;

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

pub(super) fn syncmiru_data_dir() -> PathBuf {
    dirs::data_dir().expect(t!("data-dir-panic").as_ref()).join(constants::APP_NAME)
}

pub(super) fn syncmiru_config_dir() -> PathBuf {
    dirs::config_dir().expect(t!("config-dir-panic").as_ref()).join(constants::APP_NAME)
}

pub(super) fn syncmiru_config_ini() -> PathBuf {
    syncmiru_config_dir().join(constants::CONFIG_INI_FILE_NAME)
}
