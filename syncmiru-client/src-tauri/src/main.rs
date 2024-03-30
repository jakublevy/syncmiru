// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod constants;
mod error;
mod result;
mod appstate;
mod deps;
mod files;

#[macro_use]
extern crate rust_i18n;
rust_i18n::i18n!("locales");

use result::Result;
use rust_i18n::t;
use tauri::{Window, WindowEvent};
use tauri::WindowEvent::CloseRequested;


fn main() -> Result<()> {
    let appstate = appstate::AppState { appdata: config::appdata::read_config()?.into() };
    let mut ctx = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            config::frontend::get_first_run_seen,
            config::frontend::set_first_run_seen,
            config::frontend::get_language,
            config::frontend::set_language,
            config::frontend::get_deps_state,
            config::frontend::get_target_family,
            config::frontend::set_home_srv,
            deps::frontend::mpv_start_downloading,
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