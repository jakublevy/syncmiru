use std::future::Future;
use axum::Json;
use axum_client_ip::SecureClientIp;
use hcaptcha::{Hcaptcha, HcaptchaError, HcaptchaResponse};
use log::info;
use socketioxide::extract::{State, SocketRef};
use crate::srvstate::SrvState;
use validator::{Validate, ValidationError, ValidationErrors};
use crate::models::web::{Email, RegForm, RegResponse, ResponseCode, ServiceStatus, Username, UsernameEmailUniqueResponse};
use crate::query;
use crate::result::Result;

pub async fn index(secure_ip: SecureClientIp) -> &'static str {
    info!("GET / from {}", secure_ip.0);
    "Syncmiru server"
}

pub async fn service(
    axum::extract::State(state): axum::extract::State<SrvState>,
    secure_ip: SecureClientIp
) -> Json<ServiceStatus> {
    info!("GET /service from {}", secure_ip.0);
    Json(ServiceStatus { reg_pub_allowed: state.config.reg_pub.allowed })
}


pub async fn register(
    axum::extract::State(state): axum::extract::State<SrvState>,
    secure_ip: SecureClientIp,
    Json(payload): Json<RegForm>
) -> Json<RegResponse> {
    info!("POST /register from {}", secure_ip.0);
    match payload.validate() {
        Ok(()) => {
            let unique_r = query::web::username_unique(&state.db, &payload.username).await;
            if let Err(e) = unique_r {
                return Json(RegResponse { code: ResponseCode::Err, error_fields: Vec::new() })
            }
            let unique = unique_r.unwrap();
            if !unique {
                return Json(RegResponse { code: ResponseCode::Err, error_fields: vec!["username".to_string()] })
            }

            if state.config.reg_pub.allowed {
                let hcaptcha_r = payload.valid_response(&state.config.reg_pub.hcaptcha_secret.unwrap(), None).await;
                if let Err(_) = hcaptcha_r {
                    return Json(RegResponse { code: ResponseCode::Err, error_fields: vec!["captcha".to_string()] })
                }

            }
            else {
                // TODO: check reg_tkn
                // TODO: update DB using transaction
            }
            Json(RegResponse{ code: ResponseCode::Ok, error_fields: Vec::new() })
        }
        Err(e) => {
            let error_fields_borrowed = e.0.keys().collect::<Vec<&&str>>();
            let error_fields = error_fields_borrowed
                .iter()
                .map(|&&s| s.to_string())
                .collect::<Vec<String>>();
            Json(RegResponse{ code: ResponseCode::Err, error_fields })
        }
    }
}

pub async fn username_unique(
    axum::extract::State(state): axum::extract::State<SrvState>,
    secure_ip: SecureClientIp,
    Json(payload): Json<Username>
) -> Json<UsernameEmailUniqueResponse> {
    info!("GET /username-unique from {}", secure_ip.0);
    let unique = query::web::username_unique(&state.db, &payload.username).await;
    match unique {
        Ok(true) => { Json(UsernameEmailUniqueResponse { code: ResponseCode::Yes }) },
        Ok(false) => { Json(UsernameEmailUniqueResponse { code: ResponseCode::No }) },
        Err(_) => { Json(UsernameEmailUniqueResponse { code: ResponseCode::Err }) },
    }
}

pub async fn email_unique(
    axum::extract::State(state): axum::extract::State<SrvState>,
    secure_ip: SecureClientIp,
    Json(payload): Json<Email>
) -> Json<UsernameEmailUniqueResponse> {
    info!("GET /email-unique from {}", secure_ip.0);
    let unique = query::web::email_unique(&state.db, &payload.email).await;
    match unique {
        Ok(true) => { Json(UsernameEmailUniqueResponse { code: ResponseCode::Yes }) },
        Ok(false) => { Json(UsernameEmailUniqueResponse { code: ResponseCode::No }) },
        Err(_) => { Json(UsernameEmailUniqueResponse { code: ResponseCode::Err }) },
    }
}
