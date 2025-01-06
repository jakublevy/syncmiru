use crate::result::Result;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use rust_i18n::t;


#[tauri::command]
pub fn kill_app_with_error_msg(app: tauri::AppHandle, msg: String) -> Result<()> {
    cfg_if::cfg_if! {
        if #[cfg(target_family = "windows")] {
            app
                .dialog()
                .message(msg)
                .title(t!("error-window-title"))
                .kind(MessageDialogKind::Error)
                .buttons(MessageDialogButtons::Ok)
                .blocking_show();

            app.exit(1);
        }
        else {
            app
                .dialog()
                .message(msg)
                .title(t!("error-window-title"))
                .kind(MessageDialogKind::Error)
                .buttons(MessageDialogButtons::Ok)
                .show(move |res| { app.exit(1); });
        }
    }
    Ok(())
}