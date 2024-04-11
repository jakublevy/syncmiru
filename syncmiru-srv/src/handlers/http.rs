use std::borrow::Cow;
use axum::http::StatusCode;
use axum::Json;
use axum::response::IntoResponse;
use hcaptcha::Hcaptcha;
use tower::BoxError;
use crate::srvstate::SrvState;
use validator::{Validate};
use crate::error::SyncmiruError;
use crate::models::http::{Email, RegForm, ServiceStatus, Username, ResourceUniqueResponse, EmailWithLang};
use crate::query;
use crate::result::{Result};
use crate::crypto;
use crate::email;
use crate::models::query::TokenEmailType;

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
) -> Result<Json<ResourceUniqueResponse>> {
    payload.validate()?;
    let unique = query::username_unique(&state.db, &payload.username).await?;
    Ok(Json(ResourceUniqueResponse::from(unique)))
}

pub async fn email_unique(
    axum::extract::State(state): axum::extract::State<SrvState>,
    Json(payload): Json<Email>
) -> Result<Json<ResourceUniqueResponse>> {
    payload.validate()?;
    let unique = query::email_unique(&state.db, &payload.email).await?;
    Ok(Json(ResourceUniqueResponse::from(unique)))
}

pub async fn email_verify_send(
    axum::extract::State(state): axum::extract::State<SrvState>,
    Json(payload): Json<EmailWithLang>
) -> Result<()> {
    payload.validate()?;

    let mut out_of_quota = false;
    if state.config.email.rates.is_some()
        && state.config.email.rates.unwrap().verification.is_some() {
        let rates = state.config.email.rates.unwrap().verification.unwrap();
        out_of_quota = query::out_of_email_quota(
            &state.db,
            &payload.email,
            TokenEmailType::Verify,
            rates.max,
            rates.per
        ).await?;
    }

    if out_of_quota {
        return Err(SyncmiruError::UnprocessableEntity("too many requests".to_string()))
    }

    let tkn = email::gen_tkn();
    let tkn_hash = crypto::hash(tkn.clone()).await?;
    query::new_token_email(&state.db, &payload.email, TokenEmailType::Verify, &tkn_hash).await?;
    email::send_verification_email(&state.config.email, &payload.email, &tkn, &payload.lang).await?;
    Ok(())
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
