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

#[cfg(target_family = "unix")]
mod x11;

#[cfg(target_family = "unix")]
use x11rb::rust_connection::RustConnection;

#[macro_use]
extern crate rust_i18n;
rust_i18n::i18n!("locales");

use std::collections::HashMap;
use std::sync::Arc;
use cfg_if::cfg_if;
use result::Result;
use rust_i18n::t;
use tauri::{Manager, PhysicalSize, Window, WindowEvent};
use tauri::WindowEvent::CloseRequested;
use tokio::time::Instant;

#[tokio::main]
async fn main() -> Result<()> {
    let appstate = Arc::new(appstate::AppState {
        appdata: config::appdata::read()?.into(),
        mpv_wid: None.into(),
        mpv_stop_tx: None.into(),
        mpv_ipc_tx: None.into(),
        mpv_reattach_on_fullscreen_false: false.into(),
        mpv_next_req_id: constants::MPV_MIN_USER_REQ_ID.into(),
        mpv_response_senders: HashMap::new().into(),
        mpv_ignore_fullscreen_events_timestamp: Instant::now().into(),
        mpv_ignore_next_pause_true_event: false.into(),
        mpv_ignore_next_pause_false_event: false.into(),
        mpv_ignore_next_seek_event: false.into(),
        mpv_not_ready_msg_id: None.into(),
        mpv_loading_msg_id: None.into(),
        mpv_everyone_ready_msg_id: None.into(),
        mpv_neutral_msgs: Vec::new().into(),
        mpv_ignore_next_speed_event: false.into(),
        mpv_ignore_next_audio_change_event: false.into(),
        mpv_ignore_next_sub_change_event: false.into(),
        mpv_ignore_next_audio_delay_event: false.into(),
        mpv_ignore_next_sub_delay_event: false.into(),

        #[cfg(target_family = "unix")]
        x11_conn: None.into(),

        #[cfg(target_family = "unix")]
        x11_screen_num: None.into(),
    });
    constants::init_runtime_constants().await?;
    files::create_app_dirs()?;
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
            config::frontend::set_theme,
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
            mpv::frontend::mpv_load_from_source,
            mpv::frontend::mpv_load_from_url,
            mpv::frontend::mpv_remove_current_from_playlist,
            mpv::frontend::mpv_get_loaded_info,
            mpv::frontend::mpv_set_pause,
            mpv::frontend::mpv_get_timestamp,
            mpv::frontend::mpv_seek,
            mpv::frontend::mpv_show_ready_messages,
            mpv::frontend::mpv_hide_ready_messages,
            mpv::frontend::mpv_show_msg,
            mpv::frontend::mpv_set_speed,
            mpv::frontend::mpv_get_audio,
            mpv::frontend::mpv_set_audio,
            mpv::frontend::mpv_get_sub,
            mpv::frontend::mpv_set_sub,
            mpv::frontend::mpv_get_audio_delay,
            mpv::frontend::mpv_set_audio_delay,
            mpv::frontend::mpv_get_sub_delay,
            mpv::frontend::mpv_set_sub_delay,
            mpv::frontend::mpv_clear_msgs,
            mpv::frontend::mpv_increase_playback_speed,
            mpv::frontend::mpv_decrease_playback_speed,
            mpv::frontend::mpv_get_pause,
            frontend::kill_app_with_error_msg
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            let mut factor = window.scale_factor()?;
            cfg_if! {
                if #[cfg(target_family = "unix")] {
                    if factor == 1f64 && *constants::SUPPORTED_WINDOW_SYSTEM.get().unwrap() {
                        let (conn, screen_num) = RustConnection::connect(None)?;
                        factor = x11::get_scale_factor(&conn)?;
                    }
                }
            }

            window.set_min_size(Some(PhysicalSize {
                width: (1010f64 * factor).round() as u32,
                height: (400f64 * factor).round() as u32
            }))?;
            window.set_size(PhysicalSize {
                width: (1200f64 * factor).round() as u32,
                height: (600f64 * factor).round() as u32
            })?;

            let prelude_path = app
                .path()
                .resolve("resources/prelude.lua", tauri::path::BaseDirectory::Resource)?;

            mpv::init_prelude(prelude_path)?;
            Ok(())
        })
        .on_window_event(move |window: &Window, event: &WindowEvent| {
            let w = window.clone();
            let e = event.clone();
            tokio::task::spawn(handle_window_event(w, e));
        })
        .manage(appstate)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_theme::init(ctx.config_mut()))
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
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
                if let Some(license  ) = window.get_webview_window("license") {
                    license.close().ok();
                }
                let state = window.app_handle().state();
                mpv::stop_process(&state)
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