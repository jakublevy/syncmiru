use crate::appstate::AppState;
use crate::config::appdata;
use crate::result::Result;
use crate::config::jwt;
use tauri::Manager;
use crate::login::{ServiceStatus, RegData, BooleanResp, HttpMethod};
use crate::utils;

#[tauri::command]
pub async fn can_auto_login(state: tauri::State<'_, AppState>) -> Result<bool> {
    let appdata = state.appdata.read()?;
    let jwt = jwt::read()?;
    let login_possible = appdata.home_srv.is_some() && jwt.is_some();
    Ok(login_possible)
}

#[tauri::command]
pub async fn get_home_srv(state: tauri::State<'_, AppState>) -> Result<String> {
    let srv = utils::extract_home_srv(&state.appdata)?;
    Ok(srv)
}

#[tauri::command]
pub async fn set_home_srv(state: tauri::State<'_, AppState>, home_srv: String) -> Result<()> {
    let mut appdata = state.appdata.write()?;
    appdata.home_srv = Some(home_srv.trim().to_string());
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn get_service_status(state: tauri::State<'_, AppState>) -> Result<ServiceStatus> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    let service_status: ServiceStatus = serde_json::from_value(
        super::req_json(
             &(home_srv + "/service"),
                HttpMethod::Get,
                None
            ).await?
    )?;
    Ok(service_status)
}

#[tauri::command]
pub async fn get_username_unique(state: tauri::State<'_, AppState>, username: String) -> Result<bool> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    let payload = serde_json::json!({"username": username});
    let username_unique: BooleanResp = serde_json::from_value(
        super::req_json(
            &(home_srv + "/username-unique"),
            HttpMethod::Get,
            Some(payload)
        ).await?
    )?;
    Ok(username_unique.resp)
}

#[tauri::command]
pub async fn get_email_unique(state: tauri::State<'_, AppState>, email: String) -> Result<bool> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    let payload = serde_json::json!({"email": email});
    let email_unique: BooleanResp = serde_json::from_value(
        super::req_json(
            &(home_srv + "/email-unique"),
            HttpMethod::Get,
            Some(payload)
        ).await?
    )?;
    Ok(email_unique.resp)
}

#[tauri::command]
pub async fn send_registration(state: tauri::State<'_, AppState>, data: String) -> Result<()> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    let reg_data: RegData = serde_json::from_str(&data)?;
    super::req(
        &(home_srv + "/register"),
        HttpMethod::Post,
        Some(serde_json::to_value(reg_data)?)
    ).await?;
    Ok(())
}

#[tauri::command]
pub async fn req_verification_email(state: tauri::State<'_, AppState>, email: String) -> Result<()> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    let lang = utils::extract_lang(&state.appdata)?.as_str();
    let payload = serde_json::json!({"email": email, "lang": lang});
    super::req(
        &(home_srv + "/email-verify-send"),
        HttpMethod::Post,
        Some(payload)
    ).await?;
    Ok(())
}

#[tauri::command]
pub async fn get_email_verified(state: tauri::State<'_, AppState>, email: String) -> Result<bool> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    let payload = serde_json::json!({"email": email});
    let verified: BooleanResp = serde_json::from_value(super::req_json(
        &(home_srv + "/email-verified"),
        HttpMethod::Get,
        Some(payload)
    ).await?)?;
    Ok(verified.resp)
}
