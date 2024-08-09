use crate::result::Result;
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use rust_i18n::t;


#[tauri::command]
pub fn kill_app_with_error_msg(app: tauri::AppHandle, msg: String) -> Result<()> {
    app
        .dialog()
        .message(msg)
        .title(t!("error-window-title"))
        .kind(MessageDialogKind::Error)
        .ok_button_label("Ok")
        .blocking_show();

    app.exit(1);
    Ok(())
}