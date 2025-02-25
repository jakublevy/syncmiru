use crate::crypto;
use crate::email;
use crate::error::SyncmiruError;
use crate::handlers::utils;
use crate::html;
use crate::models::http::{BooleanResp, Email, EmailVerify, ForgottenPasswordChange, Jwt, Login, RegForm, ServiceStatus, TknEmail, Username};
use crate::models::query::EmailTknType;
use crate::models::{EmailWithLang, Tkn};
use crate::result::Result;
use crate::srvstate::SrvState;
use crate::{query, tkn};
use anyhow::Context;
use axum::extract::{Query, State};
use axum::http::StatusCode;
use axum::response::{Html, IntoResponse};
use axum::Json;
use std::borrow::Cow;
use std::sync::Arc;
use tower::BoxError;
use validator::Validate;

pub async fn index() -> &'static str {
    "Syncmiru server"
}

pub async fn service(
    State(state): State<Arc<SrvState>>
) -> Json<ServiceStatus> {
    Json(ServiceStatus {
        reg_pub_allowed: state.config.reg_pub.allowed,
        wait_before_resend: state.config.email.wait_before_resend + 1,
    })
}


pub async fn register(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<RegForm>,
) -> Result<()> {
    payload.validate()?;
    let username_unique = query::username_unique(&state.db, &payload.username).await?;
    if !username_unique {
        return Err(SyncmiruError::UnprocessableEntity("username".to_string()));
    }

    let email_unique = query::email_unique(&state.db, &payload.email).await?;
    if !email_unique {
        return Err(SyncmiruError::UnprocessableEntity("email".to_string()));
    }

    let hashed_password = crypto::hash(payload.password.clone()).await?;
    if state.config.reg_pub.allowed {
        let hcaptcha_req = hcaptcha::Request::new(
            &state.config.reg_pub.hcaptcha_secret.as_ref().unwrap(),
            hcaptcha::Captcha::new(payload.captcha.as_str())?
        )?;
        let hcaptcha_client = hcaptcha::Client::new();
        let hcaptcha_valid = hcaptcha_client.verify(hcaptcha_req).await?;
        if hcaptcha_valid.success() {
            query::new_user(
                &state.db,
                &payload.username,
                &payload.displayname,
                &payload.email,
                &hashed_password,
            ).await?;
        }
        else {
            return Err(SyncmiruError::UnprocessableEntity("captcha".to_string()));
        }
    }
    else {
        if payload.reg_tkn.is_none() {
            return Err(SyncmiruError::UnprocessableEntity("reg_tkn".to_string()));
        }
        let reg_tkn_key = payload.reg_tkn.unwrap();
        let mut transaction = state.db.begin().await?;
        let reg_tkn_opt = query::get_reg_tkn_by_key_for_update(&mut transaction, &reg_tkn_key).await?;
        if reg_tkn_opt.is_none() {
            return Err(SyncmiruError::UnprocessableEntity("reg_tkn".to_string()));
        }
        let reg_tkn = reg_tkn_opt.unwrap();
        if let Some(n) = reg_tkn.max_reg {
            if reg_tkn.used >= n {
                return Err(SyncmiruError::UnprocessableEntity("reg_tkn".to_string()));
            }
        }
        query::reg_tkn_increment_used_by_id(&mut transaction, reg_tkn.id).await?;
        query::new_user_w_reg_tkn(
            &mut transaction,
            &payload.username,
            &payload.displayname,
            &payload.email,
            &hashed_password,
            reg_tkn.id
        ).await?;
        transaction.commit().await?;
    }
    Ok(())
}

pub async fn username_unique(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<Username>,
) -> Result<Json<BooleanResp>> {
    payload.validate()?;
    let unique = query::username_unique(&state.db, &payload.username).await?;
    Ok(Json(BooleanResp::from(unique)))
}

pub async fn email_unique(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<Email>,
) -> Result<Json<BooleanResp>> {
    payload.validate()?;
    let unique = query::email_unique(&state.db, &payload.email).await?;
    Ok(Json(BooleanResp::from(unique)))
}

pub async fn email_verify(
    State(state): State<Arc<SrvState>>,
    Query(payload): Query<EmailVerify>,
) -> Result<Html<String>> {
    payload.validate()?;
    let hashed_tkn = query::get_valid_hashed_tkn(
        &state.db,
        payload.uid,
        EmailTknType::Verify,
        state.config.email.token_valid_time,
    ).await?
        .context("invalid or expired token")?;

    let verified = query::get_verified_unsafe(&state.db, payload.uid).await?;
    if verified {
        return Err(SyncmiruError::UnprocessableEntity("user already verified".to_string()));
    }

    if crypto::verify(payload.tkn, hashed_tkn).await? {
        let mut transaction = state.db.begin().await?;
        query::set_verified(&mut transaction, payload.uid).await?;
        query::invalidate_email_tkn(
            &mut transaction,
            payload.uid,
            EmailTknType::Verify,
            state.config.email.token_valid_time
        ).await?;
        transaction.commit().await?;
        Ok(html::ok_verified(&payload.lang))
    }
    else {
        Err(SyncmiruError::UnprocessableEntity("invalid token".to_string()))
    }
}


pub async fn email_verify_send(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<EmailWithLang>,
) -> Result<()> {
    payload.validate()?;

    let uid = query::user_id_from_email(&state.db, &payload.email)
        .await?;
    if let None = uid {
        utils::random_sleep(2000, 3000).await;
        return Ok(())
    }
    let uid = uid.unwrap();

    let within_quota = utils::check_email_tkn_within_quota(&state, uid, EmailTknType::Verify).await?;
    if !within_quota {
        return Err(SyncmiruError::UnprocessableEntity("too many requests".to_string()));
    }

    let tkn = crypto::gen_tkn();
    let tkn_hash = crypto::hash(tkn.clone()).await?;
    query::new_email_tkn(&state.db, uid, EmailTknType::Verify, &tkn_hash).await?;
    email::send_verification_email(
        &state.config.email,
        &payload.email,
        &tkn,
        uid,
        &state.config.srv.url,
        &payload.lang,
    ).await?;
    Ok(())
}

pub async fn email_verified(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<Email>,
) -> Result<Json<BooleanResp>> {
    payload.validate()?;
    let verified = query::email_verified(&state.db, &payload.email)
        .await?
        .unwrap_or(false);
    Ok(Json(BooleanResp::from(verified)))
}

pub async fn forgotten_password_send(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<EmailWithLang>,
) -> Result<()> {
    payload.validate()?;
    let uid = query::user_id_from_email(&state.db, &payload.email).await?;
    if let None = uid {
        utils::random_sleep(2000, 3000).await;
        return Ok(())
    }
    let uid = uid.unwrap();

    let within_quota = utils::check_email_tkn_within_quota(&state, uid, EmailTknType::ForgottenPassword).await?;
    if !within_quota {
        return Err(SyncmiruError::UnprocessableEntity("too many requests".to_string()));
    }
    let tkn = crypto::gen_tkn();
    let tkn_hash = crypto::hash(tkn.clone()).await?;
    query::new_email_tkn(&state.db, uid, EmailTknType::ForgottenPassword, &tkn_hash).await?;
    email::send_forgotten_password_email(
        &state.config.email,
        &payload.email,
        &tkn,
        &state.config.srv.url,
        &payload.lang
    ).await?;
    Ok(())
}

pub async fn forgotten_password_tkn_valid(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<TknEmail>
) -> Result<Json<BooleanResp>> {
    payload.validate()?;
    let uid = query::user_id_from_email(&state.db, &payload.email)
        .await?
        .context("invalid or expired token")?;

    let hashed_tkn = query::get_valid_hashed_tkn(
        &state.db,
        uid,
        EmailTknType::ForgottenPassword,
        state.config.email.token_valid_time)
        .await?
        .context("invalid or expired token")?;

    let tkn_valid = crypto::verify(payload.tkn, hashed_tkn).await?;
    Ok(Json(BooleanResp{ resp: tkn_valid }))
}

pub async fn forgotten_password_change(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<ForgottenPasswordChange>
) -> Result<()> {
    payload.validate()?;
    let uid = query::user_id_from_email(&state.db, &payload.email)
        .await?
        .context("invalid or expired token")?;

    let hashed_tkn = query::get_valid_hashed_tkn(
        &state.db,
        uid,
        EmailTknType::ForgottenPassword,
        state.config.email.token_valid_time)
        .await?
        .context("invalid or expired token")?;

    let tkn_valid = crypto::verify(payload.tkn, hashed_tkn).await?;
    if !tkn_valid {
        return Err(SyncmiruError::UnprocessableEntity("invalid token".to_string()))
    }
    let hashed_password = crypto::hash(payload.password.clone()).await?;

    let mut transaction = state.db.begin().await?;
    query::set_user_hash(&mut transaction, uid, &hashed_password).await?;
    query::invalidate_email_tkn(
        &mut transaction,
        uid,
        EmailTknType::ForgottenPassword,
        state.config.email.token_valid_time
    ).await?;
    transaction.commit().await?;

    email::send_password_changed_warning(
        &state.config.email,
        &payload.email,
        &state.config.srv.url,
        &payload.lang
    ).await?;
    Ok(())
}

pub async fn new_login(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<Login>
) -> Result<Json<Jwt>> {
    payload.validate()?;
    let email_exists = !query::email_unique(&state.db, &payload.email).await?;
    if !email_exists {
        utils::random_sleep(300, 500).await;
        return Err(SyncmiruError::AuthError)
    }
    let uid = query::user_id_from_email(&state.db, &payload.email).await?.unwrap();
    let pass_hash = query::get_user_hash_unsafe(&state.db, uid).await?;
    if !crypto::verify(payload.password, pass_hash).await? {
        return Err(SyncmiruError::AuthError)
    }
    let email_verified = query::email_verified(&state.db, &payload.email).await?.unwrap();
    if !email_verified {
        return Err(SyncmiruError::EmailNotVerified)
    }
    let jwt = tkn::new_login(&state.config.login_jwt, uid)?;
    let session_exists = query::exists_session_with_hwid(
        &state.db, &payload.hwid_hash, uid
    ).await?;
    if session_exists {
        query::update_session(
            &state.db,
            &payload.os,
            &payload.device_name,
            &payload.hwid_hash
        ).await?;
    }
    else {
        query::new_session(
            &state.db,
            &payload.os,
            &payload.device_name,
            &payload.hwid_hash,
            uid
        ).await?;
    }

    Ok(Json(Jwt { jwt }))
}

pub async fn reg_tkn_valid(
    State(state): State<Arc<SrvState>>,
    Json(payload): Json<Tkn>
) -> Result<Json<BooleanResp>> {
    payload.validate()?;
    let exists = query::reg_tkn_exists(&state.db, &payload.tkn).await?;
    if !exists {
        return Err(SyncmiruError::UnprocessableEntity("invalid registration token".to_string()))
    }
    let reg_tkn = query::get_reg_tkn_by_key(
        &state.db,
        &payload.tkn
    ).await?;
    if let Some(n) = reg_tkn.max_reg {
        Ok(Json(BooleanResp { resp: reg_tkn.used < n }))
    }
    else {
        Ok(Json(BooleanResp{ resp: true }))
    }
}

pub async fn error(error: BoxError) -> impl IntoResponse {
    if error.is::<tower::timeout::error::Elapsed>() {
        return (StatusCode::REQUEST_TIMEOUT, Cow::from("request timed out"));
    }

    if error.is::<tower::load_shed::error::Overloaded>() {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            Cow::from("service is overloaded, try again later"),
        );
    }

    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Cow::from(format!("Unhandled internal error: {error}")),
    )
}
