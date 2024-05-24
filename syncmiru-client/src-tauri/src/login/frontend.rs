use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use anyhow::Context;
use serde_json::Value;
use crate::appstate::AppState;
use crate::config::appdata;
use crate::result::Result;
use crate::config::jwt;
use tauri::Manager;
use whoami::fallible::hostname;
use crate::login::{ServiceStatus, RegData, BooleanResp, HttpMethod, TknEmail, ForgottenPasswordChange, LoginForm, NewLogin, Jwt, Tkn};
use crate::{sys};

#[tauri::command]
pub async fn can_auto_login(state: tauri::State<'_, AppState>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    let jwt = jwt::read()?;
    let login_possible = appdata.home_srv.is_some() && jwt.is_some();
    Ok(login_possible)
}

#[tauri::command]
pub async fn get_home_srv(state: tauri::State<'_, AppState>) -> Result<String> {
    let srv = state.read_home_srv().await?;
    Ok(srv)
}

#[tauri::command]
pub async fn set_home_srv(state: tauri::State<'_, AppState>, home_srv: String) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.home_srv = Some(home_srv.trim().to_string());
    }
    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_service_status(state: tauri::State<'_, AppState>) -> Result<ServiceStatus> {
    let home_srv = state.read_home_srv().await?;
    let service_status: ServiceStatus = serde_json::from_value(
        super::req_json(
            &(home_srv + "/service"),
            HttpMethod::Get,
            None,
        ).await?
    )?;
    Ok(service_status)
}

#[tauri::command]
pub async fn get_username_unique(state: tauri::State<'_, AppState>, username: String) -> Result<bool> {
    let home_srv = state.read_home_srv().await?;
    let payload = serde_json::json!({"username": username});
    let username_unique: BooleanResp = serde_json::from_value(
        super::req_json(
            &(home_srv + "/username-unique"),
            HttpMethod::Get,
            Some(payload),
        ).await?
    )?;
    Ok(username_unique.resp)
}

#[tauri::command]
pub async fn get_email_unique(state: tauri::State<'_, AppState>, email: String) -> Result<bool> {
    let home_srv = state.read_home_srv().await?;
    let payload = serde_json::json!({"email": email});
    let email_unique: BooleanResp = serde_json::from_value(
        super::req_json(
            &(home_srv + "/email-unique"),
            HttpMethod::Get,
            Some(payload),
        ).await?
    )?;
    Ok(email_unique.resp)
}

#[tauri::command]
pub async fn send_registration(state: tauri::State<'_, AppState>, data: String) -> Result<()> {
    let home_srv = state.read_home_srv().await?;
    let reg_data: RegData = serde_json::from_str(&data)?;
    super::req(
        &(home_srv + "/register"),
        HttpMethod::Post,
        Some(serde_json::to_value(reg_data)?),
    ).await?;
    Ok(())
}

#[tauri::command]
pub async fn req_verification_email(state: tauri::State<'_, AppState>, email: String) -> Result<()> {
    let home_srv = state.read_home_srv().await?;
    let lang = state.appdata.read().await.lang;
    let payload = serde_json::json!({"email": email, "lang": lang});
    super::req(
        &(home_srv + "/email-verify-send"),
        HttpMethod::Post,
        Some(payload),
    ).await?;
    Ok(())
}

#[tauri::command]
pub async fn get_email_verified(state: tauri::State<'_, AppState>, email: String) -> Result<bool> {
    let home_srv = state.read_home_srv().await?;
    let payload = serde_json::json!({"email": email});
    let verified: BooleanResp = serde_json::from_value(super::req_json(
        &(home_srv + "/email-verified"),
        HttpMethod::Get,
        Some(payload),
    ).await?)?;
    Ok(verified.resp)
}

#[tauri::command]
pub async fn req_forgotten_password_email(state: tauri::State<'_, AppState>, email: String) -> Result<()> {
    let home_srv = state.read_home_srv().await?;
    let lang = state.appdata.read().await.lang;
    let payload = serde_json::json!({"email": email, "lang": lang});
    super::req(
        &(home_srv + "/forgotten-password-send"),
        HttpMethod::Post,
        Some(payload),
    ).await?;
    Ok(())
}

#[tauri::command]
pub async fn get_forgotten_password_tkn_valid(state: tauri::State<'_, AppState>, data: String) -> Result<bool> {
    let home_srv = state.read_home_srv().await?;
    let tkn_email: TknEmail = serde_json::from_str(&data)?;
    let tkn_valid: BooleanResp = serde_json::from_value(super::req_json(
        &(home_srv + "/forgotten-password-tkn-valid"),
        HttpMethod::Get,
        Some(serde_json::to_value(tkn_email)?),
    ).await?)?;
    Ok(tkn_valid.resp)
}

#[tauri::command]
pub async fn forgotten_password_change_password(state: tauri::State<'_, AppState>, data: String) -> Result<()> {
    let home_srv = state.read_home_srv().await?;
    let fp_change: ForgottenPasswordChange = serde_json::from_str(&data)?;
    super::req(
        &(home_srv + "/forgotten-password-change"),
        HttpMethod::Post,
        Some(serde_json::to_value(fp_change)?),
    ).await?;
    Ok(())
}

#[tauri::command]
pub async fn new_login(state: tauri::State<'_, AppState>, data: String) -> Result<()> {
    let home_srv = state.read_home_srv().await?;
    let login: LoginForm = serde_json::from_str(&data)?;
    let send = NewLogin {
        email: login.email,
        password: login.password,
        os: std::env::consts::OS.to_string(),
        hwid_hash: sys::id_hashed()?,
        device_name: sys::device(),
    };
    let payload: Jwt = serde_json::from_value(super::req_json(
        &(home_srv + "/new-login"),
        HttpMethod::Post,
        Some(serde_json::to_value(send)?),
    ).await?)?;
    jwt::write(&payload.jwt)?;
    Ok(())
}

#[tauri::command]
pub async fn reg_tkn_valid(state: tauri::State<'_, AppState>, data: String) -> Result<bool> {
    let home_srv = state.read_home_srv().await?;
    let tkn: Tkn = serde_json::from_str(&data)?;
    let tkn_valid: BooleanResp = serde_json::from_value(super::req_json(
        &(home_srv + "/reg-tkn-valid"),
        HttpMethod::Get,
        Some(serde_json::to_value(tkn)?),
    ).await?)?;
    Ok(tkn_valid.resp)
}