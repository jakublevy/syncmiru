use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use sqlx::PgPool;
use validator::ValidationError;
use crate::query;

pub fn check_username_format(username: &str) -> Result<(), ValidationError> {
    if username.len() < 4 || username.len() > 16 {
        return Err(ValidationError::new("invalid length"))
    }

    for c in username.chars() {
        if !c.is_ascii_lowercase() {
            return Err(ValidationError::new("invalid characters"))
        }
    }
    Ok(())
}

async fn check_username_unique(username: &str, db: &PgPool) -> Result<(), ValidationError> {
    match query::username_unique(db, username).await {
        Ok(true) => Ok(()),
        Ok(false) => Err(ValidationError::new("not unique")),
        _ => Err(ValidationError::new("internal error"))
    }
}

pub fn check_displayname_format(displayname: &str) -> Result<(), ValidationError> {
    if displayname.len() < 4 || displayname.len() > 16 {
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
    if password.len() < 8 {
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
    if tkn.len() != 24 {
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
        .map_err(|e| ValidationError::new("not a valid picture"))?;
    if pic.width() != 128 {
        return Err(ValidationError::new("invalid avatar width"))
    }
    if pic.height() != 128 {
        return Err(ValidationError::new("invalid avatar height"))
    }
    Ok(())
}

pub fn check_reg_tkn_name(name: &str) -> Result<(), ValidationError> {
    if name.len() < 1 || name.len() > 16 {
        return Err(ValidationError::new("invalid name length"));
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