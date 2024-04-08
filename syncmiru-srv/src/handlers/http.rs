use std::borrow::Cow;
use axum::http::StatusCode;
use axum::Json;
use axum::response::IntoResponse;
use hcaptcha::Hcaptcha;
use tower::BoxError;
use crate::srvstate::SrvState;
use validator::{Validate};
use crate::error::SyncmiruError;
use crate::models::http::{Email, RegForm, ServiceStatus, Username, ResourceUniqueResponse};
use crate::query;
use crate::result::{Result};
use crate::crypto;

pub async fn index() -> &'static str {
    "Syncmiru server"
}

pub async fn service(
    axum::extract::State(state): axum::extract::State<SrvState>
) -> Json<ServiceStatus> {
    Json(ServiceStatus { reg_pub_allowed: state.config.reg_pub.allowed })
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
        query::new_user(
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
