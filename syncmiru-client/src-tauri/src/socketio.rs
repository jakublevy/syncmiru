use std::sync::Arc;
use anyhow::Context;
use rust_socketio::asynchronous::{Client};
use rust_socketio::Payload;
use tauri::Manager;
use crate::appstate::AppState;
use crate::{appstate, config};
use crate::result::Result;

pub async fn test(
    state: Arc<AppState>,
    payload: Payload,
    socket: Client,
) -> Result<()> {
    let appdata = state.appdata.read()?;
    println!("test callback");
    println!("home_srv from appdata: {:?}", appdata.home_srv);
    println!("lang from appdata: {:?}", appdata.lang);
    println!("payload: {:?}", payload);
    Ok(())
}

pub async fn error(
    state: Arc<AppState>,
    payload: Payload,
    socket: Client,
) -> Result<()> {
    if let Payload::Text(t) = payload {
        let v = t.get(0).context("missing error value")?;
        let s = serde_json::to_string(v)?;
        eprintln!("error: {}", &s);
        if s.contains("Auth error") {
            let window = appstate::extract::window(&state.window)?;
            config::jwt::clear()?;
            window.emit("auth-error", {})?;
        }
        else if s.contains("EngineIO Error") {
            eprintln!("will emit engineio error event");
            let window = appstate::extract::window(&state.window)?;
            window.emit("conn-error", {})?;
        }
    }
    Ok(())
}

pub async fn open(
    state: Arc<AppState>,
    payload: Payload,
    socket: Client,
) -> Result<()> {
    let window = appstate::extract::window(&state.window)?;
    window.emit("conn-open", {})?;
    Ok(())
}
