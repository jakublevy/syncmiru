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
    if displayname.len() < 4 || displayname.len() > 24 {
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
    for c in tkn.chars() {
        if !alphabet.contains(c) {
            return Err(ValidationError::new("invalid symbol inside token"))
        }
    }
    Ok(())
}