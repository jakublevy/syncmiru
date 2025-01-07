//! This module contains utility functions for config module

use crate::config::Language;


/// Converts a string representation of a boolean value from an INI file into a `bool`.
///
/// # Parameters:
/// - `str`: The input string to be converted. Expected values are `"1"`, `"0"`, `"true"`, or `"false"`.
/// - `default`: The fallback boolean value to use if the input string does not match the expected values.
///
/// # Returns:
/// - `true` if the string is `"1"` or `"true"` (case-insensitive).
/// - `false` if the string is `"0"` or `"false"` (case-insensitive).
/// - `default` if the string does not match any of the above.
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

/// Converts a boolean value into an INI-compatible string representation.
///
/// # Parameters:
/// - `b`: The boolean value to convert.
///
/// # Returns:
/// - `"1"` if the boolean value is `true`.
/// - `"0"` if the boolean value is `false`.
pub(super) fn ini_bool_to_string(b: bool) -> String {
    if b {
        "1".to_string()
    }
    else {
        "0".to_string()
    }
}

/// Determines the user's preferred language based on the system locale.
///
/// This function checks the system's available locales and attempts to match
/// them to predefined language preferences. If no match is found, English is used as the default.
///
/// # Returns:
/// - `Language::Czech` if the locale starts with `"cs"`.
/// - `Language::English` otherwise.
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
