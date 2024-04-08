use crate::appstate::AppState;
use crate::config::appdata;
use crate::result::Result;
use crate::config::jwt;
use tauri::Manager;
use crate::login::{ServiceStatus, service_status, username_unique, email_unique, YN};
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
     Ok(service_status(&home_srv).await?)
}

#[tauri::command]
pub async fn get_username_unique(state: tauri::State<'_, AppState>, username: String) -> Result<bool> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    Ok(username_unique(&home_srv, &username).await?)
}

#[tauri::command]
pub async fn get_email_unique(state: tauri::State<'_, AppState>, email: String) -> Result<bool> {
    let home_srv = utils::extract_home_srv(&state.appdata)?;
    Ok(email_unique(&home_srv, &email).await?)
}
