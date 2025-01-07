//! This module provides utility functions to interact with mpv window on a Windows platform
//! using Win32 API calls.

use std::ffi::c_void;
use std::ops::{BitAnd, BitOr};
use std::sync::Arc;
use std::time::Duration;
use tokio::time::sleep;
use windows::Win32::Foundation::{BOOL, HWND, LPARAM};
use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, GetWindowLongPtrW, GetWindowThreadProcessId, GWL_STYLE, HWND_TOP, IsWindowVisible, SetForegroundWindow, SetParent, SetWindowLongPtrW, SetWindowPos, SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE, SWP_NOZORDER, WINDOW_STYLE, WS_BORDER, WS_CAPTION, WS_THICKFRAME};
use crate::appstate::AppState;
use crate::mpv::window::HtmlElementRect;
use crate::result::Result;


/// Hides the borders (caption and frame) of the mpv window identified by `mpv_wid`.
///
/// # Parameters
/// - `mpv_wid`: The window identifier of the mpv window.
///
/// # Returns
/// - `Result<()>`: A result indicating the success or failure of the operation.
pub async fn hide_borders(_: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let hwnd = id2hwnd(mpv_wid);
    Ok(unsafe {
        let style = WINDOW_STYLE(GetWindowLongPtrW(hwnd, GWL_STYLE) as u32);
        let new_style = style.bitand(!WS_BORDER.bitor(WS_CAPTION).bitor(WS_THICKFRAME));
        SetWindowLongPtrW(hwnd, GWL_STYLE, new_style.0 as isize);
    })
}

/// Shows the borders (caption and frame) of the mpv window identified by `mpv_wid`.
///
/// # Parameters
/// - `mpv_wid`: The window identifier of the mpv window.
///
/// # Returns
/// - `Result<()>`: A result indicating the success or failure of the operation.
pub(super) async fn show_borders(_: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let hwnd = id2hwnd(mpv_wid);
    Ok(unsafe {
        let style = WINDOW_STYLE(GetWindowLongPtrW(hwnd, GWL_STYLE) as u32);
        let new_style = style.bitor(WS_BORDER.bitor(WS_CAPTION).bitor(WS_THICKFRAME));
        SetWindowLongPtrW(hwnd, GWL_STYLE, new_style.0 as isize);
    })
}


/// Reparents the mpv window identified by `mpv_wid` to a new parent window identified by `parent_wid`.
///
/// # Parameters
/// - `mpv_wid`: The window identifier of the mpv window.
/// - `parent_wid`: The window identifier of the new parent window.
///
/// # Returns
/// - `Result<()>`: A result indicating the success or failure of the operation.
pub(super) async fn reparent(_: &Arc<AppState>, mpv_wid: usize, parent_wid: usize) -> Result<()> {
    let mpv = id2hwnd(mpv_wid);
    let parent = id2hwnd(parent_wid);
    Ok(unsafe {
        SetParent(mpv, parent)?;
    })
}


/// Repositions the mpv window identified by `mpv_wid` within the container's rectangle (`container_rect`).
///
/// # Parameters
/// - `mpv_wid`: The window identifier of the mpv window.
/// - `container_rect`: The rectangle representing the new position and size of the window.
///
/// # Returns
/// - `Result<()>`: A result indicating the success or failure of the operation.
pub async fn reposition(_: &Arc<AppState>, mpv_wid: usize, container_rect: &HtmlElementRect) -> Result<()> {
    let hwnd = id2hwnd(mpv_wid);
    Ok(unsafe {
        SetWindowPos(
            hwnd,
            HWND::default(),
            container_rect.x.round() as i32,
            container_rect.y.round() as i32,
            container_rect.width.round() as i32,
            container_rect.height.round() as i32,
            SWP_NOZORDER | SWP_NOACTIVATE
        )?;
    })
}


/// Unparents the mpv window identified by `mpv_wid`, detaching it from its current parent.
///
/// # Parameters
/// - `mpv_wid`: The window identifier of the mpv window.
///
/// # Returns
/// - `Result<()>`: A result indicating the success or failure of the operation.
pub(super) async fn unparent(_: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let hwnd = id2hwnd(mpv_wid);
    Ok(unsafe {
        SetParent(hwnd, HWND::default())?;
    })
}


/// Brings the mpv window identified by `mpv_wid` to the foreground and focuses it.
///
/// # Parameters
/// - `mpv_wid`: The window identifier of the mpv window.
///
/// # Returns
/// - `Result<()>`: A result indicating the success or failure of the operation.
pub async fn focus(_: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let hwnd = id2hwnd(mpv_wid);
    Ok(unsafe {
        let _ = SetForegroundWindow(hwnd);
        SetWindowPos(hwnd, HWND_TOP, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE)?;
    })
}


/// Converts a process ID (`pid`) to a window identifier (`mpv_wid`) by searching for the mpv window associated with the process.
///
/// # Parameters
/// - `pid`: The process ID to search for.
///
/// # Returns
/// - `Result<Option<usize>>`: A result containing an optional window identifier if found, or `None` if no matching window is found.
pub async fn pid2wid(_: &Arc<AppState>, pid: u32) -> Result<Option<usize>> {
    static mut FOUND_HWND: Option<HWND> = None;
    unsafe extern "system" fn enum_windows_proc(hwnd: HWND, l_param: LPARAM) -> BOOL {
        let mut process_id = 0u32;
        let process_id_opt: Option<*mut u32> = Some(&mut process_id);
        GetWindowThreadProcessId(hwnd, process_id_opt);
        if let Some(process_id) = process_id_opt {
            if *process_id == l_param.0 as u32 && IsWindowVisible(hwnd).as_bool() {
                FOUND_HWND = Some(hwnd);
                BOOL(0)
            }
            else {
                BOOL(1)
            }
        }
        else {
            BOOL(1)
        }
    }

    Ok(unsafe {
        FOUND_HWND = None;
        while FOUND_HWND.is_none() {
            EnumWindows(Some(enum_windows_proc), LPARAM(pid as isize)).ok();
            sleep(Duration::from_millis(10)).await;
        }
        FOUND_HWND.map(|x|x.0 as usize)
    })
}

/// Converts a mpv window identifier (`mpv_id`) to a `HWND` (window handle) type for Win32 API interactions.
///
/// # Parameters
/// - `mpv_id`: The window identifier of the `mpv` window.
///
/// # Returns
/// - `HWND`: A `HWND` representing the window handle.
fn id2hwnd(mpv_id: usize) -> HWND {
    HWND(mpv_id as *mut c_void)
}