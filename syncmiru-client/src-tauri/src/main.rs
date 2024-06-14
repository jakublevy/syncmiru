// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod constants;
mod error;
mod result;
mod appstate;
mod deps;
mod files;
mod login;
mod sys;
mod player;
mod license;

#[macro_use]
extern crate rust_i18n;
rust_i18n::i18n!("locales");

use result::Result;
use rust_i18n::t;
use tauri::{Manager, Window, WindowEvent};
use tauri::WindowEvent::CloseRequested;


fn main() -> Result<()> {
    let appstate = appstate::AppState { appdata: config::appdata::read()?.into() };
    let mut ctx = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            config::frontend::get_first_run_seen,
            config::frontend::set_first_run_seen,
            config::frontend::get_users_shown,
            config::frontend::set_users_shown,
            config::frontend::get_audio_sync,
            config::frontend::set_audio_sync,
            config::frontend::get_sub_sync,
            config::frontend::set_sub_sync,
            config::frontend::get_language,
            config::frontend::set_language,
            config::frontend::get_target_family,
            config::frontend::get_jwt,
            config::frontend::clear_jwt,
            config::frontend::get_hwid_hash,
            deps::frontend::get_deps_state,
            deps::frontend::mpv_start_downloading,
            deps::frontend::yt_dlp_start_downloading,
            deps::frontend::get_deps_versions_fetch,
            login::frontend::get_home_srv,
            login::frontend::set_home_srv,
            login::frontend::can_auto_login,
            login::frontend::get_service_status,
            login::frontend::get_username_unique,
            login::frontend::get_email_unique,
            login::frontend::send_registration,
            login::frontend::req_verification_email,
            login::frontend::get_email_verified,
            login::frontend::req_forgotten_password_email,
            login::frontend::get_forgotten_password_tkn_valid,
            login::frontend::forgotten_password_change_password,
            login::frontend::new_login,
            login::frontend::reg_tkn_valid,
            license::open_license_window,
        ])
        .on_window_event(handle_window_event)
        .manage(appstate)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_theme::init(ctx.config_mut()))
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            let _ = focus_window(app);
        }))
        .run(ctx)
        .expect(t!("tauri-app-error").as_ref());

    Ok(())
}

fn handle_window_event(window: &Window, event: &WindowEvent) {
    match event {
        CloseRequested { .. } => {
            if window.label() == "main" {
                files::delete_tmp().expect("Deleting tmp files failed")
            }
        }
        _ => {}
    }
}

fn focus_window(app: &tauri::AppHandle) {
    app.webview_windows()
        .values()
        .next()
        .expect("No window found")
        .set_focus()
        .expect("Cannot get window to focus");
}