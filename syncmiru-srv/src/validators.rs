use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use url::Url;
use validator::ValidationError;
use crate::constants::SOCKETIO_ACK_TIMEOUT;
use crate::models::query::Id;
use crate::srvstate::{PlaylistEntryId, UserReadyStatus};

pub fn check_username_format(username: &str) -> Result<(), ValidationError> {
    if username.chars().count() < 4 || username.chars().count() > 16 {
        return Err(ValidationError::new("invalid length"))
    }

    for c in username.chars() {
        if !c.is_ascii_lowercase() {
            return Err(ValidationError::new("invalid characters"))
        }
    }
    Ok(())
}

pub fn check_displayname_format(displayname: &str) -> Result<(), ValidationError> {
    if displayname.chars().count() < 4 || displayname.chars().count() > 16 {
        return Err(ValidationError::new("invalid length"))
    }
    if displayname.chars().next().unwrap().is_whitespace() {
        return Err(ValidationError::new("starts with whitespace"))
    }
    if displayname.chars().rev().next().unwrap().is_whitespace() {
        return Err(ValidationError::new("ends with whitespace"))
    }
    Ok(())
}

pub fn check_password_format(password: &str) -> Result<(), ValidationError> {
    if password.chars().count() < 8 {
        return Err(ValidationError::new("too short, min 8 chars required"))
    }
    Ok(())
}

pub fn check_lang(lang: &str) -> Result<(), ValidationError> {
    if lang != "cs" && lang != "en" {
        return Err(ValidationError::new("unknown language"))
    }
    Ok(())
}

pub fn check_tkn(tkn: &str) -> Result<(), ValidationError> {
    if tkn.chars().count() != 24 {
        return Err(ValidationError::new("invalid token length"))
    }
    let alphabet = base64::alphabet::STANDARD.as_str();
    let mut padding = false;
    for c in tkn.chars() {
        if !alphabet.contains(c) {
            if c == '=' {
                padding = true
            }
            else if padding {
                return Err(ValidationError::new("invalid symbol inside token"))
            }
        }
    }
    Ok(())
}

pub fn check_reg_tkn(tkn_opt: &Option<String>) -> Result<(), ValidationError> {
    if let Some(tkn) = tkn_opt {
        check_tkn(tkn)
    }
    else {
        Ok(())
    }
}

pub fn check_avatar(data: &[u8]) -> Result<(), ValidationError> {
    if data.len() < 1 || data.len() > 5242880 {
        return Err(ValidationError::new("invalid avatar size"))
    }

    let pic = image::load_from_memory(data)
        .map_err(|_| ValidationError::new("not a valid picture"))?;
    if pic.width() != 128 {
        return Err(ValidationError::new("invalid avatar width"))
    }
    if pic.height() != 128 {
        return Err(ValidationError::new("invalid avatar height"))
    }
    Ok(())
}

pub fn check_reg_tkn_name(reg_tkn_name: &str) -> Result<(), ValidationError> {
    if reg_tkn_name.chars().count() < 1 || reg_tkn_name.chars().count() > 16 {
        return Err(ValidationError::new("invalid reg_tkn_name length"));
    }
    Ok(())
}

pub fn check_reg_tkn_max_regs(max_regs_opt: &Option<i32>) -> Result<(), ValidationError> {
    if let Some(max_regs) = max_regs_opt {
        if *max_regs < 1 {
            return Err(ValidationError::new("invalid max_regs value"))
        }
    }
    Ok(())
}

pub fn check_playback_speed(playback_speed: &Decimal) -> Result<(), ValidationError> {
    if playback_speed < &dec!(1.0) || playback_speed > &dec!(2.0) {
        return Err(ValidationError::new("invalid playback_speed value"))
    }
    Ok(())
}

pub fn check_desync_tolerance(desync_tolerance: &Decimal) -> Result<(), ValidationError> {
    if desync_tolerance < &dec!(1.0) || desync_tolerance > &dec!(3.0) {
        return Err(ValidationError::new("invalid desync_tolerance value"))
    }
    Ok(())
}

pub fn check_major_desync_min(major_desync_min: &Decimal) -> Result<(), ValidationError> {
    if major_desync_min < &dec!(4.0) || major_desync_min > &dec!(10.0) {
        return Err(ValidationError::new("invalid major_desync_min value"))
    }
    Ok(())
}

pub fn check_minor_desync_playback_slow(minor_desync_playback_slow: &Decimal) -> Result<(), ValidationError> {
    if minor_desync_playback_slow < &dec!(0.01) || minor_desync_playback_slow > &dec!(0.1) {
        return Err(ValidationError::new("invalid minor_desync_playback_slow value"))
    }
    Ok(())
}

pub fn check_room_name(room_name: &str) -> Result<(), ValidationError> {
    if room_name.chars().count() < 1 || room_name.chars().count() > 16 {
        return Err(ValidationError::new("invalid room_name length"));
    }
    if room_name.chars().next().unwrap().is_whitespace() {
        return Err(ValidationError::new("room_name starts with whitespace"))
    }
    if room_name.chars().rev().next().unwrap().is_whitespace() {
        return Err(ValidationError::new("room_name ends with whitespace"))
    }
    Ok(())
}

pub fn check_room_order(room_order: &Vec<Id>) -> Result<(), ValidationError> {
    let valid = room_order.iter().all(|&x|x >= 1);
    if !valid {
        return Err(ValidationError::new("invalid room_order room id"));
    }
    Ok(())
}

pub fn check_ping(ping: &f64) -> Result<(), ValidationError> {
    if *ping <= 0f64 && *ping > SOCKETIO_ACK_TIMEOUT.as_millis() as f64 {
        return Err(ValidationError::new("invalid ping value"))
    }
    Ok(())
}

pub fn check_path(path: &str) -> Result<(), ValidationError> {
    if path.is_empty() {
        return Err(ValidationError::new("empty path"))
    }
    else if !path.starts_with("/") {
        return Err(ValidationError::new("invalid path"))
    }
    Ok(())
}

pub fn check_source_files_paths(paths: &Vec<String>) -> Result<(), ValidationError> {
    for path in paths {
        let split_opt = path.split_once(":");
        if split_opt.is_none() {
            return Err(ValidationError::new("invalid source file path"))
        }
        let (_, path) = split_opt.unwrap();
        let first_char_opt = path.chars().next();
        if first_char_opt.is_none() {
            return Err(ValidationError::new("invalid source file path"))
        }
        if let Some(first_char) = first_char_opt {
            if first_char != '/' {
                return Err(ValidationError::new("invalid source file path"))
            }
        }
        let last_char = path.chars().last().unwrap();
        if last_char == '/' {
            return Err(ValidationError::new("invalid source file path"))
        }
    }
    Ok(())
}

pub fn check_urls(urls: &Vec<String>) -> Result<(), ValidationError> {
    for url in urls {
        let parsed_url_r = Url::parse(url);
        if parsed_url_r.is_err() {
            return Err(ValidationError::new("invalid url"))
        }
        let parsed_url = parsed_url_r.unwrap();
        if parsed_url.scheme() != "https" && parsed_url.scheme() != "http" {
            return Err(ValidationError::new("invalid url"))
        }
    }
    Ok(())
}

pub fn check_playlist_entry_id(id: &PlaylistEntryId) -> Result<(), ValidationError> {
    if *id < 1u64 {
        return Err(ValidationError::new("invalid playlist entry id"))
    }
    Ok(())
}

pub fn check_playlist_order(order: &Vec<PlaylistEntryId>) -> Result<(), ValidationError> {
    for entry in order {
        if check_playlist_entry_id(entry).is_err() {
            return Err(ValidationError::new("invalid playlist entry id in playlist order"))
        }
    }
    Ok(())
}

pub fn check_aid_sid(aid_sid: &Option<u64>) -> Result<(), ValidationError> {
    if aid_sid.is_none() || aid_sid.is_some_and(|x| x > 0) {
        Ok(())
    }
    else {
        Err(ValidationError::new("invalid aid or sid value"))
    }
}

pub fn check_ready_not_ready(r: &UserReadyStatus) -> Result<(), ValidationError> {
    if *r == UserReadyStatus::Ready || *r == UserReadyStatus::NotReady {
        Ok(())
    }
    else {
        Err(ValidationError::new("User ready status is not ready or not ready"))
    }
}