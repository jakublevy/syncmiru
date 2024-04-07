use axum::Json;
use axum_client_ip::SecureClientIp;
use hcaptcha::{Hcaptcha, HcaptchaError, HcaptchaResponse};
use log::info;
use socketioxide::extract::{State, SocketRef};
use crate::srvstate::SrvState;
use validator::{Validate, ValidationError, ValidationErrors};
use crate::models::web::{RegForm, RegResponse, ResponseCode, ServiceStatus};
use crate::query;

pub async fn index(secure_ip: SecureClientIp) -> &'static str {
    info!("GET / from {}", secure_ip.0);
    "Syncmiru server"
}



pub async fn service(axum::extract::State(state): axum::extract::State<SrvState>, secure_ip: SecureClientIp) -> Json<ServiceStatus> {
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
