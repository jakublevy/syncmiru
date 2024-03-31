use crate::appstate::AppState;
use crate::config::appdata::write_config;
use crate::result::Result;
use crate::config::jwt::read_login_tkn;

#[tauri::command]
pub async fn can_auto_login(state: tauri::State<'_, AppState>) -> Result<bool> {
    let appdata = state.appdata.read()?;
    write_config(&appdata)?;

    let jwt = read_login_tkn()?;
    let login_possible = appdata.home_srv.is_some() && jwt.is_some();
    Ok(login_possible)
}

#[tauri::command]
pub async fn set_home_srv(state: tauri::State<'_, AppState>, home_srv: String) -> Result<()> {
    let mut appdata = state.appdata.write()?;

    //TODO: check url

    appdata.home_srv = Some(home_srv);
    write_config(&appdata)?;
    Ok(())
}