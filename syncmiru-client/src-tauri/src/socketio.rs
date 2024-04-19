use std::sync::Arc;
use rust_socketio::asynchronous::{Client};
use rust_socketio::Payload;
use tauri::Manager;
use crate::appstate::AppState;
use crate::config;

pub async fn test(
    state: Arc<AppState>,
    payload: Payload,
    socket: Client,
) {
    let appdata = state.appdata.read().unwrap();
    println!("test callback");
    println!("home_srv from appdata: {:?}", appdata.home_srv);
    println!("lang from appdata: {:?}", appdata.lang);
    println!("payload: {:?}", payload);
}

pub async fn error(
    state: Arc<AppState>,
    payload: Payload,
    socket: Client,
) {
    if let Payload::Text(t) = payload {
        if let Some(v) = t.get(0) {
            if let Ok(s) = serde_json::to_string(v) {
                eprintln!("error: {}", &s);
                if s.contains("Auth error") {
                    let window = state.window.read()
                        .expect("error reading tauri::window")
                        .clone()
                        .expect("error reading tauri::window");
                    config::jwt::clear()
                        .expect("error clearing JWT");
                    window.emit("auth-error", {})
                        .expect("error notifying auth-error")
                }
                else if s.contains("EngineIO Error") {
                    eprintln!("disconnect handle todo")
                    // TODO: handle disconnect
                }
            }
        }
    }
}

pub async fn open(
    state: Arc<AppState>,
    payload: Payload,
    socket: Client,
) {
    // TODO: handle connect / reconnect
    println!("open called with payload {:?}", payload);
}