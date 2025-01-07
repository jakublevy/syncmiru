//! This module implements various routines for working with windows in a cross-platform
//! environment.

use std::env;
use cfg_if::cfg_if;
use crate::result::Result;

#[cfg(target_family = "unix")]
use gtk::prelude::WidgetExt;

#[cfg(target_family = "unix")]
use crate::constants;

/// A trait to extend window objects with functionality to retrieve the native ID.
pub trait WindowExt {
    async fn native_id(&self) -> Result<Option<usize>>;
}

/// The implementation of the `WindowExt` trait for `tauri::Window`
///
/// This implementation provides a platform-specific way to retrieve the native
/// window ID for a Tauri window. The method supports multiple platforms and
/// uses conditional compilation to determine the appropriate behavior.
///
/// # Errors
/// This method can return an error if:
/// - On Windows, retrieving the `HWND` fails.
/// - On Linux, accessing the GTK window or the associated `GdkWindow` fails.
impl WindowExt for tauri::Window {
    async fn native_id(&self) -> Result<Option<usize>> {
        cfg_if!{
            if #[cfg(target_family = "windows")] {
                Ok(Some(self.hwnd()?.0 as usize))
            }
            else {
                if *constants::SUPPORTED_WINDOW_SYSTEM.get().unwrap() {
                    let gtk_window = self.gtk_window()?;
                    let window_opt = gtk_window.window();
                    let window = window_opt.unwrap();
                    Ok(Some(unsafe {gdk_x11_window_get_xid(window) as usize}))
                }
                else {
                    Ok(None)
                }
            }
        }
    }
}

/// Checks if the current window system is supported.
///
/// # Returns
/// `true` if a supported window system (Win32, X11) is detected, `false` otherwise.
pub(super) fn is_supported_window_system() -> bool {
    if cfg!(target_family = "windows") {
        true
    }
    else if cfg!(target_family = "unix") {
        if let Some(_) = env::var_os("WAYLAND_DISPLAY") {
            false
        }
        else if let Some(_) = env::var_os("DISPLAY") {
            true
        }
        else {
            false
        }
    }
    else {
        false
    }
}

/// Checks if the system is currently running on Wayland.
///
/// # Returns
/// `true` if the system is running Wayland, `false` otherwise.
pub fn is_wayland() -> bool {
    if cfg!(target_family = "unix") {
        if let Some(_) = env::var_os("WAYLAND_DISPLAY") {
            return true
        }
    }
    false
}

/// Loads the external `gdk_x11_window_get_xid` function for Unix-based systems.
/// The function `gdk_x11_window_get_xid` is part of the GDK (GTK) bindings for
/// X11, and it is used to obtain the XID, a unique identifier for a window
/// in the X Window System.
#[cfg(target_family = "unix")]
extern {
    pub fn gdk_x11_window_get_xid(window: gdk::Window) -> u32;
}
