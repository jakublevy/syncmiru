use std::env;
use gtk::prelude::WidgetExt;
use crate::result::Result;

pub trait WindowExt {
    async fn native_id(&self) -> Result<Option<usize>>;
}

impl WindowExt for tauri::Window {
    async fn native_id(&self) -> Result<Option<usize>> {
        cfg_if::cfg_if!{
            if #[cfg(target_family = "windows")] {
                Ok(Some(self.hwnd()?.0 as usize))
            }
            else {
                if is_supported_window_system().await? {
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

pub async fn is_supported_window_system() -> Result<bool> {
    if cfg!(target_family = "windows") {
        Ok(true)
    }
    else if cfg!(target_family = "unix") {
        if let Some(_) = env::var_os("WAYLAND_DISPLAY") {
            Ok(false)
        }
        else if let Some(_) = env::var_os("DISPLAY") {
            Ok(true)
        }
        else {
            Ok(false)
        }
    }
    else {
        Ok(false)
    }
}

#[cfg(target_family = "unix")]
extern {
    pub fn gdk_x11_window_get_xid(window: gdk::Window) -> u32;
}
