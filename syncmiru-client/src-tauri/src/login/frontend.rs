//! The `login` module handles the communication between the frontend and backend for user authentication.

use std::sync::Arc;
use crate::appstate::AppState;
use crate::config::appdata;
use crate::result::Result;
use crate::config::jwt;
use crate::login::{ServiceStatus, RegData, BooleanResp, HttpMethod, TknEmail, ForgottenPasswordChange, LoginForm, NewLogin, Jwt, Tkn};
use crate::{sys};

/// Checks if the user can automatically log in by verifying if there are valid login credentials stored (home service and JWT).
///
/// # Parameters
/// - `state`: The application state containing the user data and configuration.
///
/// # Returns
/// - `Result<bool>`: Returns `true` if auto-login is possible, `false` otherwise, or an error if there is an issue with reading the state or JWT.
#[tauri::command]
pub async fn can_auto_login(state: tauri::State<'_, Arc<AppState>>) -> Result<bool> {
    let appdata = state.appdata.read().await;
    let jwt = jwt::read()?;
    let login_possible = appdata.home_srv.is_some() && jwt.is_some();
    Ok(login_possible)
}

/// Retrieves the home server URL from the application state.
///
/// # Parameters
/// - `state`: The application state containing the home server information.
///
/// # Returns
/// - `Result<String>`: The URL of the home server or an error if there is an issue with reading the home server.
#[tauri::command]
pub async fn get_home_srv(state: tauri::State<'_, Arc<AppState>>) -> Result<String> {
    let srv = state.read_home_srv().await?;
    Ok(srv)
}

/// Sets the home server URL in the application state.
///
/// # Parameters
/// - `state`: The application state where the home server URL will be stored.
/// - `home_srv`: The new home server URL to be set.
///
/// # Returns
/// - `Result<()>`: Success if the home server URL is successfully set, or an error if there is an issue with setting the URL.
#[tauri::command]
pub async fn set_home_srv(state: tauri::State<'_, Arc<AppState>>, home_srv: String) -> Result<()> {
    {
        let mut appdata = state.appdata.write().await;
        appdata.home_srv = Some(home_srv.trim().to_string());
    }
    let appdata = state.appdata.read().await;
    appdata::write(&appdata)?;
    Ok(())
}

/// Fetches the service status from the home server.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
///
/// # Returns
/// - `Result<ServiceStatus>`: The status of the home service or an error if there is an issue with retrieving the service status.
#[tauri::command]
pub async fn get_service_status(state: tauri::State<'_, Arc<AppState>>) -> Result<ServiceStatus> {
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

/// Checks if a given username is unique on the home server.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `username`: The username to check for uniqueness.
///
/// # Returns
/// - `Result<bool>`: `true` if the username is unique, `false` otherwise, or an error if there is an issue with checking the uniqueness.
#[tauri::command]
pub async fn get_username_unique(state: tauri::State<'_, Arc<AppState>>, username: String) -> Result<bool> {
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

/// Checks if a given email is unique on the home server.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `email`: The email to check for uniqueness.
///
/// # Returns
/// - `Result<bool>`: `true` if the email is unique, `false` otherwise, or an error if there is an issue with checking the email uniqueness.
#[tauri::command]
pub async fn get_email_unique(state: tauri::State<'_, Arc<AppState>>, email: String) -> Result<bool> {
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

/// Sends a registration request to the home server with the provided registration data.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `data`: A JSON string containing the registration data.
///
/// # Returns
/// - `Result<()>`: Success if the registration is successful, or an error if there is an issue with sending the registration request.
#[tauri::command]
pub async fn send_registration(state: tauri::State<'_, Arc<AppState>>, data: String) -> Result<()> {
    let home_srv = state.read_home_srv().await?;
    let reg_data: RegData = serde_json::from_str(&data)?;
    super::req(
        &(home_srv + "/register"),
        HttpMethod::Post,
        Some(serde_json::to_value(reg_data)?),
    ).await?;
    Ok(())
}

/// Requests a verification email to be sent to the given email address.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `email`: The email address to send the verification to.
///
/// # Returns
/// - `Result<()>`: Success if the request is successful, or an error if there is an issue with requesting the verification email.
#[tauri::command]
pub async fn req_verification_email(state: tauri::State<'_, Arc<AppState>>, email: String) -> Result<()> {
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

/// Checks if the given email is verified on the home server.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `email`: The email address to check for verification.
///
/// # Returns
/// - `Result<bool>`: `true` if the email is verified, `false` otherwise, or an error if there is an issue with checking the email verification status.
#[tauri::command]
pub async fn get_email_verified(state: tauri::State<'_, Arc<AppState>>, email: String) -> Result<bool> {
    let home_srv = state.read_home_srv().await?;
    let payload = serde_json::json!({"email": email});
    let verified: BooleanResp = serde_json::from_value(super::req_json(
        &(home_srv + "/email-verified"),
        HttpMethod::Get,
        Some(payload),
    ).await?)?;
    Ok(verified.resp)
}

/// Requests a forgotten password email to be sent to the given email address.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `email`: The email address to send the forgotten password email to.
///
/// # Returns
/// - `Result<()>`: Success if the request is successful, or an error if there is an issue with requesting the forgotten password email.
#[tauri::command]
pub async fn req_forgotten_password_email(state: tauri::State<'_, Arc<AppState>>, email: String) -> Result<()> {
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

/// Checks if the forgotten password token is valid on the home server.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `data`: A JSON string containing the token and email information.
///
/// # Returns
/// - `Result<bool>`: `true` if the token is valid, `false` otherwise, or an error if there is an issue with checking the token validity.
#[tauri::command]
pub async fn get_forgotten_password_tkn_valid(state: tauri::State<'_, Arc<AppState>>, data: String) -> Result<bool> {
    let home_srv = state.read_home_srv().await?;
    let tkn_email: TknEmail = serde_json::from_str(&data)?;
    let tkn_valid: BooleanResp = serde_json::from_value(super::req_json(
        &(home_srv + "/forgotten-password-tkn-valid"),
        HttpMethod::Get,
        Some(serde_json::to_value(tkn_email)?),
    ).await?)?;
    Ok(tkn_valid.resp)
}

/// Changes the user's password using the forgotten password token.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `data`: A JSON string containing the token and new password information.
///
/// # Returns
/// - `Result<()>`: Success if the password is successfully changed, or an error if there is an issue with changing the password.
#[tauri::command]
pub async fn forgotten_password_change_password(state: tauri::State<'_, Arc<AppState>>, data: String) -> Result<()> {
    let home_srv = state.read_home_srv().await?;
    let fp_change: ForgottenPasswordChange = serde_json::from_str(&data)?;
    super::req(
        &(home_srv + "/forgotten-password-change"),
        HttpMethod::Post,
        Some(serde_json::to_value(fp_change)?),
    ).await?;
    Ok(())
}

/// Performs the new login process with the provided credentials and device information.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `data`: A JSON string containing the login information.
///
/// # Returns
/// - `Result<()>`: Success if the login is successful, or an error if there is an issue with the login process.
#[tauri::command]
pub async fn new_login(state: tauri::State<'_, Arc<AppState>>, data: String) -> Result<()> {
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


/// Checks if the given registration token is valid on the home server.
///
/// # Parameters
/// - `state`: The application state containing the home server URL.
/// - `data`: A JSON string containing the token information.
///
/// # Returns
/// - `Result<bool>`: `true` if the registration token is valid, `false` otherwise, or an error if there is an issue with checking the token validity.
#[tauri::command]
pub async fn reg_tkn_valid(state: tauri::State<'_, Arc<AppState>>, data: String) -> Result<bool> {
    let home_srv = state.read_home_srv().await?;
    let tkn: Tkn = serde_json::from_str(&data)?;
    let tkn_valid: BooleanResp = serde_json::from_value(super::req_json(
        &(home_srv + "/reg-tkn-valid"),
        HttpMethod::Get,
        Some(serde_json::to_value(tkn)?),
    ).await?)?;
    Ok(tkn_valid.resp)
}