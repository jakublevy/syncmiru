use std::sync::Arc;
use cfg_if::cfg_if;
use tauri::{Manager, PhysicalSize};
use crate::appstate::AppState;
use crate::result::Result;

#[cfg(target_family = "unix")]
use x11rb::rust_connection::RustConnection;

#[cfg(target_family = "unix")]
use crate::{constants, x11};
use crate::config::Theme;

#[tauri::command]
pub async fn open_license_window(
    state: tauri::State<'_, Arc<AppState>>,
    app: tauri::AppHandle,
) -> Result<()> {
    let license_window_opt = app.get_webview_window("license");
    if let Some(license_window) = license_window_opt {
        license_window.set_focus()?;
        return Ok(())
    }
    let mut theme = Theme::Auto;
    {
        let appdata = state.appdata.read().await;
        theme = appdata.theme;
    }
    let mut license_window_builder = tauri::WebviewWindowBuilder::new(
        &app,
        "license",
        tauri::WebviewUrl::App("license.html".into())
    );
    if theme != Theme::Auto {
        license_window_builder = license_window_builder.theme(Some(theme.into()))
    }

    let license_window = license_window_builder.build()?;


    let mut factor = license_window.scale_factor()?;
    cfg_if! {
        if #[cfg(target_family = "unix")] {
            if factor == 1f64 && *constants::SUPPORTED_WINDOW_SYSTEM.get().unwrap() {
                let conn: &RustConnection;
                let mut new_connection: RustConnection;

                let x11_conn_rl = state.x11_conn.read().await;
                let conn_opt = x11_conn_rl.as_ref();
                if let Some(c) = conn_opt {
                    conn = c;
                }
                else {
                    let (c, screen_num) = RustConnection::connect(None)?;
                    new_connection = c;
                    conn = &new_connection
                }
                factor = x11::get_scale_factor(&conn)?;
            }
        }
    }

    let min_size = PhysicalSize{
        width: (900f64 * factor).round() as u32,
        height: (400f64 * factor).round() as u32
    };
    license_window.set_title(&t!("license-window-title"))?;
    license_window.set_min_size(Some(min_size))?;
    license_window.set_size(min_size)?;
    license_window.show()?;
    Ok(())
}
