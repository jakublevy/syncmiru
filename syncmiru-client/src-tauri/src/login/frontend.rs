use crate::appstate::AppState;
use crate::config::appdata::write_config;
use crate::result::Result;

#[tauri::command]
pub async fn set_home_srv(state: tauri::State<'_, AppState>, home_srv: String) -> Result<()> {
    let mut appdata = state.appdata.write()?;

    //TODO: check url

    appdata.home_srv = Some(home_srv);
    write_config(&appdata)?;
    Ok(())
}