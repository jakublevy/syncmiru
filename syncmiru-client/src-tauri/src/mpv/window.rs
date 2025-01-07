//! This module handles window-specific functionality related to mpv video player integration.

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
use tauri::{Emitter};
use crate::appstate::AppState;
use crate::result::Result;
use crate::window::WindowExt;


/// Attaches the mpv window to the application's window.
///
/// # Parameters
/// - `state`: The shared application state that contains various configuration data.
/// - `window`: The Tauri window to which the mpv window should be attached.
/// - `mpv_wid`: The window ID of the mpv window to attach.
///
/// # Returns
/// - `Result<()>`: Returns `Ok(())` if successful, or an error if the operation fails.
pub async fn attach(state: &Arc<AppState>, window: &tauri::Window, mpv_wid: usize) -> Result<()> {
    let syncmiru_id = window
        .native_id().await?
        .context("could not get tauri window id, possibly broken window system")?;

    hide_borders(state, mpv_wid).await?;
    sleep(Duration::from_millis(100)).await;
    reparent(state, mpv_wid, syncmiru_id).await?;
    window.emit("mpv-resize", {})?;
    sleep(Duration::from_millis(50)).await;
    focus(state, mpv_wid).await?;
    Ok(())
}


/// Detaches the mpv window from the application's window, restoring borders and refocusing the window.
///
/// # Parameters
/// - `state`: The shared application state that contains various configuration data.
/// - `mpv_wid`: The window ID of the mpv window to detach.
///
/// # Returns
/// - `Result<()>`: Returns `Ok(())` if successful, or an error if the operation fails.
pub async fn detach(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    unparent(state, mpv_wid).await?;
    sleep(Duration::from_millis(100)).await;
    show_borders(state, mpv_wid).await?;
    sleep(Duration::from_millis(50)).await;
    focus(state, mpv_wid).await?;
    Ok(())
}


/// A struct to represent the rectangular bounds of an HTML element, including position and size.
///
/// This is used to map the position and dimensions of elements for proper integration with the mpv window.
///
/// # Fields
/// - `x`: The x-coordinate of the top-left corner of the element.
/// - `y`: The y-coordinate of the top-left corner of the element.
/// - `width`: The width of the element.
/// - `height`: The height of the element.
#[derive(Deserialize, Debug)]
pub struct HtmlElementRect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}