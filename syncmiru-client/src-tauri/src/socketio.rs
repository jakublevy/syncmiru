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
            }
        }
    }
    //eprintln!("Error: {:#?}", payload)
    // let v = t
    //     .get(0)
    //     .expect("No error received from srv");
    // let s = serde_json::to_string(v)
    //     .expect("Invalid format received from srv");
    //
    //
    // let start = s.find("{")
    //     .expect("Invalid format received from srv");
    // let end = s.rfind("}")
    //     .expect("Invalid format received from srv");
    // let sub = &s[start..end+1];
    // eprintln!("string = {}", s);
    // eprintln!("sub = {}", sub);
    // let error: ErrorFromSrv = serde_json::from_str(sub)
    //     .expect("Invalid format received from srv");
    // eprintln!("after parsing = {:?}", error);

    //eprintln!()
    //payload
    // TODO: emit error back
    //eprintln!("Error: {:#?}", error)
}