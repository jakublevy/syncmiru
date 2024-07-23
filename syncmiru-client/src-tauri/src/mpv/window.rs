#[cfg(target_family = "windows")]
pub mod win32;

#[cfg(target_family = "unix")]
pub mod x11;

use std::env;
use anyhow::Context;
#[cfg(target_family = "windows")]
pub use self::win32::*;

#[cfg(target_family = "unix")]
pub use self::x11::*;

use serde::Deserialize;
use tauri::Manager;
use crate::result::Result;
use crate::window::WindowExt;

pub fn attach(window: &tauri::Window, mpv_wid: usize) -> Result<()> {
    let syncmiru_id = window
        .native_id()?
        .context("could not get tauri window id, possibly broken window system")?;

    hide_borders(mpv_wid);
    reparent(mpv_wid, syncmiru_id)?;
    window.emit("mpv-resize", {})?;
    Ok(())
}

pub fn detach(mpv_wid: usize) -> Result<()> {
    unparent(mpv_wid)?;
    show_borders(mpv_wid);
    focus(mpv_wid)?;
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