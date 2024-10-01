use tauri::{LogicalSize, Manager};
use crate::result::Result;

#[tauri::command]
pub async fn open_license_window(
    app: tauri::AppHandle,
) -> Result<()> {
    let license_window_opt = app.get_webview_window("license");
    if let Some(license_window) = license_window_opt {
        license_window.set_focus()?;
        return Ok(())
    }
    let license_window = tauri::WebviewWindowBuilder::new(
        &app,
        "license",
        tauri::WebviewUrl::App("license.html".into())
    ).build()?;

    let min_size = LogicalSize{width: 900, height: 400};
    license_window.set_title(&t!("license-window-title"))?;
    license_window.set_min_size(Some(min_size))?;
    license_window.set_size(min_size)?;
    license_window.show()?;
    Ok(())
}
