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
mod license;
mod mpv;
mod hash;
mod window;
mod frontend;

#[macro_use]
extern crate rust_i18n;
rust_i18n::i18n!("locales");

use std::sync::Arc;
use result::Result;
use rust_i18n::t;
use tauri::{Manager, Window, WindowEvent};
use tauri::WindowEvent::CloseRequested;

#[tokio::main]
async fn main() -> Result<()> {
    let appstate = Arc::new(appstate::AppState {
        appdata: config::appdata::read()?.into(),
        mpv_wid: None.into(),
        mpv_stop_tx: None.into(),
        mpv_ipc_tx: None.into(),
        mpv_reattach_on_fullscreen_false: false.into(),
        mpv_next_req_id: 1.into(),

        #[cfg(target_family = "unix")]
        mpv_ignore_next_fullscreen_event: false.into(),

        #[cfg(target_family = "unix")]
        x11_conn: None.into(),

        #[cfg(target_family = "unix")]
        x11_screen_num: None.into(),
    });
    files::create_app_dirs()?;
    mpv::init_prelude()?;
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
            config::frontend::get_mpv_win_detached,
            config::frontend::set_mpv_win_detached,
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
            mpv::frontend::mpv_start,
            mpv::frontend::mpv_quit,
            mpv::frontend::get_is_supported_window_system,
            mpv::frontend::mpv_wrapper_size_changed,
            mpv::frontend::mpv_reposition_to_small,
            frontend::kill_app_with_error_msg
        ])
        .on_window_event(move |window: &Window, event: &WindowEvent| {
            let w = window.clone();
            let e = event.clone();
            tokio::task::spawn(handle_window_event(w, e));
        })
        .manage(appstate)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_theme::init(ctx.config_mut()))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
            let _ = focus_window(app);
        }))
        .run(ctx)
        .expect(t!("tauri-app-error").as_ref());

    Ok(())
}

async fn handle_window_event(window: Window, event: WindowEvent) {
    match event {
        CloseRequested { .. } => {
            if window.label() == "main" {
                let state = window.app_handle().state();
                mpv::stop_process(&state, window.clone())
                    .await
                    .expect("stopping mpv process failed");
                files::delete_tmp().expect("Deleting tmp files failed");
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