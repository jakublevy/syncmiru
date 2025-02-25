use std::env;
use cfg_if::cfg_if;
use crate::result::Result;

#[cfg(target_family = "unix")]
use gtk::prelude::WidgetExt;

#[cfg(target_family = "unix")]
use crate::constants;

pub trait WindowExt {
    async fn native_id(&self) -> Result<Option<usize>>;
}

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

pub fn is_wayland() -> bool {
    if cfg!(target_family = "unix") {
        if let Some(_) = env::var_os("WAYLAND_DISPLAY") {
            return true
        }
    }
    false
}

#[cfg(target_family = "unix")]
extern {
    pub fn gdk_x11_window_get_xid(window: gdk::Window) -> u32;
}
