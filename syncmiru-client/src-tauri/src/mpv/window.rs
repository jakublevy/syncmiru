#[cfg(target_family = "windows")]
pub mod win32;

#[cfg(target_family = "unix")]
pub mod x11;

use std::env;
use std::sync::Arc;
use std::time::Duration;
use anyhow::Context;
#[cfg(target_family = "windows")]
pub use self::win32::*;

#[cfg(target_family = "unix")]
pub use self::x11::*;

use serde::Deserialize;
use tauri::Manager;
use tokio::time::sleep;
use crate::appstate::AppState;
use crate::result::Result;
use crate::window::WindowExt;

pub async fn attach(state: &Arc<AppState>, window: &tauri::Window, mpv_wid: usize) -> Result<()> {
    let syncmiru_id = window
        .native_id().await?
        .context("could not get tauri window id, possibly broken window system")?;

    hide_borders(state, mpv_wid).await?;
    sleep(Duration::from_millis(30)).await;
    reparent(state, mpv_wid, syncmiru_id).await?;
    window.emit("mpv-resize", {})?;
    Ok(())
}

pub async fn detach(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    unparent(state, mpv_wid)?;
    show_borders(state, mpv_wid).await?;
    focus(state, mpv_wid).await?;
    Ok(())
}

#[derive(Deserialize, Debug)]
pub struct HtmlElementRect {
    x: f64,
    y: f64,
    top: f64,
    right: f64,
    bottom: f64,
    left: f64,
    width: f64,
    height: f64,
}