use crate::appstate::AppState;
use crate::config::appdata;
use crate::result::Result;
use crate::config::jwt;
use tauri::Manager;
use crate::login::{ServiceStatus, RegData, email_bool_check};
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
     Ok(super::get_service_status(&home_srv).await?)
}

#[tauri::command]
pub async fn get_username_unique(state: tauri::State<'_, AppState>, username: String) -> Result<bool> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    Ok(super::get_username_unique(&home_srv, &username).await?)
}

#[tauri::command]
pub async fn get_email_unique(state: tauri::State<'_, AppState>, email: String) -> Result<bool> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    Ok(email_bool_check(&home_srv, &email, "/email-unique").await?)
}

#[tauri::command]
pub async fn send_registration(state: tauri::State<'_, AppState>, data: String) -> Result<()> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    let reg_data: RegData = serde_json::from_str(&data)?;
    super::send_registration(&home_srv, &reg_data).await?;
    Ok(())
}

#[tauri::command]
pub async fn req_verification_email(state: tauri::State<'_, AppState>, email: String) -> Result<()> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    let lang = utils::extract_lang(&state.appdata)?.as_str();
    super::req_verification_email(&home_srv, &email, lang).await?;
    Ok(())
}

#[tauri::command]
pub async fn get_email_verified(state: tauri::State<'_, AppState>, email: String) -> Result<bool> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    Ok(email_bool_check(&home_srv, &email, "/email-verified").await?)
}
