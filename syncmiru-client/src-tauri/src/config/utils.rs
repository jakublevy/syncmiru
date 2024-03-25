use std::path::PathBuf;
use keyring::Entry;
use crate::config::Language;
use crate::constants;

pub(super) fn ini_str_to_bool(str: &str) -> bool {
    let s = str.trim();
    if s == "1" || s.to_lowercase() == "true" {
        true
    }
    else {
        false
    }
}

pub(super) fn ini_bool_to_str(b: bool) -> String {
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
    dirs::data_dir().expect(constants::DATA_DIR_PANIC_MSG).join(constants::APP_NAME)
}

pub(super) fn syncmiru_config_dir() -> PathBuf {
    dirs::config_dir().expect(constants::CONFIG_DIR_PANIC_MSG).join(constants::APP_NAME)
}

pub(super) fn syncmiru_config_ini() -> PathBuf {
    syncmiru_config_dir().join(constants::CONFIG_INI_FILE_NAME)
}

pub(super) fn load_login_jwt() -> crate::result::Result<String> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    Ok(entry.get_password()?)
}

pub(super) fn write_login_jwt(jwt: &str) -> crate::result::Result<()> {
    let entry = Entry::new(constants::KEYRING_SERVICE, constants::KEYRING_LOGIN_JWT_USER)?;
    entry.set_password(jwt)?;
    Ok(())
}

