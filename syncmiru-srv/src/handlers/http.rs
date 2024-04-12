use std::borrow::Cow;
use anyhow::Context;
use axum::extract::Query;
use axum::http::StatusCode;
use axum::Json;
use axum::response::{Html, IntoResponse};
use hcaptcha::Hcaptcha;
use tower::BoxError;
use crate::srvstate::SrvState;
use validator::{Validate};
use crate::error::SyncmiruError;
use crate::models::http::{Email, RegForm, ServiceStatus, Username, BooleanResp, EmailWithLang, EmailVerify};
use crate::query;
use crate::result::{Result};
use crate::crypto;
use crate::email;
use crate::models::query::EmailTknType;
use crate::html;

pub async fn index() -> &'static str {
    "Syncmiru server"
}

pub async fn service(
    axum::extract::State(state): axum::extract::State<SrvState>
) -> Json<ServiceStatus> {
    Json(ServiceStatus {
        reg_pub_allowed: state.config.reg_pub.allowed,
        wait_before_resend: state.config.email.wait_before_resend
    })
}


pub async fn register(
    axum::extract::State(state): axum::extract::State<SrvState>,
    Json(payload): Json<RegForm>
) -> Result<()> {
    payload.validate()?;
    let username_unique = query::username_unique(&state.db, &payload.username).await?;
    if !username_unique {
        return Err(SyncmiruError::UnprocessableEntity("username".to_string()))
    }

    let email_unique = query::email_unique(&state.db, &payload.email).await?;
    if !email_unique {
        return Err(SyncmiruError::UnprocessableEntity("email".to_string()))
    }

    let hashed_password = crypto::hash(payload.password.clone()).await?;
    if state.config.reg_pub.allowed {
        payload.valid_response(&state.config.reg_pub.hcaptcha_secret.unwrap(), None).await?;
        query::new_account(
            &state.db,
            &payload.username,
            &payload.displayname,
            &payload.email,
            &hashed_password
        ).await?;
    }
    else {
        // TODO: check reg_tkn
        // TODO: update DB using transaction
    }
    Ok(())
}

pub async fn username_unique(
    axum::extract::State(state): axum::extract::State<SrvState>,
    Json(payload): Json<Username>
) -> Result<Json<BooleanResp>> {
    payload.validate()?;
    let unique = query::username_unique(&state.db, &payload.username).await?;
    Ok(Json(BooleanResp::from(unique)))
}

pub async fn email_unique(
    axum::extract::State(state): axum::extract::State<SrvState>,
    Json(payload): Json<Email>
) -> Result<Json<BooleanResp>> {
    payload.validate()?;
    let unique = query::email_unique(&state.db, &payload.email).await?;
    Ok(Json(BooleanResp::from(unique)))
}

pub async fn email_verify(
    axum::extract::State(state): axum::extract::State<SrvState>,
    Query(payload): Query<EmailVerify>
) -> Result<Html<String>> {
    payload.validate()?;
    let hashed_tkn = query::get_valid_hashed_tkn(
        &state.db,
        payload.uid,
        EmailTknType::Verify,
        state.config.email.token_valid_time
    ).await?
     .context("invalid or expired token")?;

    if crypto::verify(payload.tkn, hashed_tkn).await? {
        query::set_verified(&state.db, payload.uid).await?;
        Ok(html::ok_verified(&payload.lang))
    }
    else {
        Err(SyncmiruError::UnprocessableEntity("invalid token".to_string()))
    }
}

pub async fn email_verify_send(
    axum::extract::State(state): axum::extract::State<SrvState>,
    Json(payload): Json<EmailWithLang>
) -> Result<()> {
    payload.validate()?;

    let uid = query::user_id_from_email(&state.db, &payload.email)
        .await?
        .context("user does not exist")?;

    let mut out_of_quota = false;
    if state.config.email.rates.is_some()
        && state.config.email.rates.unwrap().verification.is_some() {
        let rates = state.config.email.rates.unwrap().verification.unwrap();
        out_of_quota = query::out_of_email_quota(
            &state.db,
            uid,
            EmailTknType::Verify,
            rates.max,
            rates.per
        ).await?;
    }

    if out_of_quota {
        return Err(SyncmiruError::UnprocessableEntity("too many requests".to_string()))
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
        &payload.lang
    ).await?;
    Ok(())
}

pub async fn email_verified(
    axum::extract::State(state): axum::extract::State<SrvState>,
    Json(payload): Json<Email>
) -> Result<Json<BooleanResp>> {
    payload.validate()?;
    let verified = query::email_verified(&state.db, &payload.email)
        .await?
        .unwrap_or(false);
    println!("VERIFIED = {}", verified);
    Ok(Json(BooleanResp::from(verified)))
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
