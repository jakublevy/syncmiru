#[cfg(target_family = "windows")]
pub mod win32;

#[cfg(target_family = "unix")]
pub mod x11;

use std::sync::Arc;
use tokio::time::sleep;
use std::time::Duration;
use anyhow::Context;
#[cfg(target_family = "windows")]
pub use self::win32::*;

#[cfg(target_family = "unix")]
pub use self::x11::*;

use serde::Deserialize;
use tauri::{Emitter, Manager};
use crate::appstate::AppState;
use crate::result::Result;
use crate::window::WindowExt;

pub async fn attach(state: &Arc<AppState>, window: &tauri::Window, mpv_wid: usize) -> Result<()> {
    let syncmiru_id = window
        .native_id().await?
        .context("could not get tauri window id, possibly broken window system")?;

    hide_borders(state, mpv_wid).await?;
    sleep(Duration::from_millis(50)).await;
    reparent(state, mpv_wid, syncmiru_id).await?;
    window.emit("mpv-resize", {})?;
    Ok(())
}

pub async fn detach(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    unparent(state, mpv_wid).await?;
    sleep(Duration::from_millis(50)).await;
    show_borders(state, mpv_wid).await?;
    focus(state, mpv_wid).await?;
    Ok(())
}

#[derive(Deserialize, Debug)]
pub struct HtmlElementRect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}