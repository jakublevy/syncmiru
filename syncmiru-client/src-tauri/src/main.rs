// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod constants;
mod error;
mod result;
mod deps;
mod appstate;

#[macro_use]
extern crate rust_i18n;
rust_i18n::i18n!("locales");

use result::Result;
use rust_i18n::t;


fn main() -> Result<()> {
    let appstate = appstate::AppState { appdata: config::appdata::read_config()?.into() };
    let mut ctx = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            config::appdata::frontend::get_first_run_seen,
            config::appdata::frontend::set_first_run_seen,
            config::appdata::frontend::get_language,
            config::appdata::frontend::set_language,
            config::appdata::frontend::set_home_srv,
        ])
        .manage(appstate)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_theme::init(ctx.config_mut()))
        .run(ctx)
        .expect(t!("tauri-app-error").as_ref());

    Ok(())
}
