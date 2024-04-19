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
mod utils;
mod sys;
mod socketio;

#[macro_use]
extern crate rust_i18n;
rust_i18n::i18n!("locales");

use result::Result;
use rust_i18n::t;
use tauri::{Window, WindowEvent};
use tauri::WindowEvent::CloseRequested;


fn main() -> Result<()> {
    let appstate = appstate::AppState { appdata: config::appdata::read()?.into(), socket: None.into() };
    let mut ctx = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            config::frontend::get_first_run_seen,
            config::frontend::set_first_run_seen,
            config::frontend::get_language,
            config::frontend::set_language,
            config::frontend::get_target_family,
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
            login::frontend::login,
        ])
        .on_window_event(handle_window_event)
        .manage(appstate)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_theme::init(ctx.config_mut()))
        .run(ctx)
        .expect(t!("tauri-app-error").as_ref());

    Ok(())
}

fn handle_window_event(window: &Window, event: &WindowEvent) {
    match event {
        CloseRequested {.. } => {
            files::delete_tmp().expect("Deleting tmp files failed")
        }
        _ => {}
    }
}