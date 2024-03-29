use crate::appstate::AppState;
use crate::deps::utils::delete_deps;
use crate::result::Result;




#[tauri::command]
pub async fn mpv_start_downloading(state: tauri::State<'_, AppState>) -> Result<()> {
    delete_deps()?;
    // rm local/mpv
    //start downloading
    Ok(())
}

#[tauri::command]
pub async fn yt_dlp_start_downloading(state: tauri::State<'_, AppState>) -> Result<()> {
    // rm local/yt-dlp
    //start downloading
    Ok(())
}