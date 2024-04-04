use crate::appstate::AppState;
use crate::config::appdata;
use crate::result::Result;
use crate::config::jwt;
use std::thread;
use std::time::Duration;
use tauri::Manager;

#[tauri::command]
pub async fn can_auto_login(state: tauri::State<'_, AppState>) -> Result<bool> {
    let appdata = state.appdata.read()?;
    let jwt = jwt::read()?;
    let login_possible = appdata.home_srv.is_some() && jwt.is_some();
    Ok(login_possible)
}

#[tauri::command]
pub async fn get_home_srv(state: tauri::State<'_, AppState>) -> Result<String> {
    let appdata = state.appdata.read()?;
    Ok(appdata.home_srv.clone().unwrap_or("".to_string()))
}

#[tauri::command]
pub async fn set_home_srv(state: tauri::State<'_, AppState>, home_srv: String) -> Result<()> {
    let mut appdata = state.appdata.write()?;

    //TODO: check url

    appdata.home_srv = Some(home_srv);
    appdata::write(&appdata)?;
    Ok(())
}

#[tauri::command]
pub async fn test_command(window: tauri::Window, state: tauri::State<'_, AppState>) -> Result<()> {
    thread::spawn(move || {
        for i in 0..10 {
            window.emit("msg", {});
            thread::sleep(Duration::from_secs(3));
        }
    });
    Ok(())
}