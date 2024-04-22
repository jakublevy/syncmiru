use std::sync::Arc;
use crate::appstate;
use crate::appstate::AppState;
use crate::config::jwt;
use crate::result::Result;
use crate::socketio::drop_connection;

#[tauri::command]
pub async fn socketio_drop(state: tauri::State<'_, Arc<AppState>>) -> Result<()> {
    let socket_opt = appstate::extract::socket(&state.socket)?;
    drop_connection(&socket_opt).await?;
    Ok(())
}

#[tauri::command]
pub async fn reconnecting_sign_out(state: tauri::State<'_, Arc<AppState>>) -> Result<()> {
    let socket_opt = appstate::extract::socket(&state.socket)?;
    drop_connection(&socket_opt).await?;
    jwt::clear()?;
    Ok(())
}