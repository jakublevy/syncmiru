//! This module contains Tauri commands for managing windows and handling the application lifecycle.

use crate::result::Result;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};
use rust_i18n::t;

/// Tauri command that displays an error message and exits the application.
///
/// This function is invoked when a critical error occurs in the application.
/// It displays an error message dialog to the user, then terminates the application.
///
/// # Arguments
/// - `app`: The `tauri::AppHandle` that represents the application's instance. This is used to manage dialogs and window behaviors.
/// - `msg`: A `String` containing the error message to be displayed in the dialog.
///
/// # Returns
/// - `Result<()>`: A result type to handle potential errors that may arise from the dialog or exit process.
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