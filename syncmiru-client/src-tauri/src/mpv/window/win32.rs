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

pub(super) async fn hide_borders(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let hwnd = id2hwnd(mpv_wid);
    Ok(unsafe {
        let style = WINDOW_STYLE(GetWindowLongPtrW(hwnd, GWL_STYLE) as u32);
        let new_style = style.bitand(!WS_BORDER.bitor(WS_CAPTION).bitor(WS_THICKFRAME));
        SetWindowLongPtrW(hwnd, GWL_STYLE, new_style.0 as isize);
    })
}

pub(super) async fn show_borders(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let hwnd = id2hwnd(mpv_wid);
    Ok(unsafe {
        let style = WINDOW_STYLE(GetWindowLongPtrW(hwnd, GWL_STYLE) as u32);
        let new_style = style.bitor(WS_BORDER.bitor(WS_CAPTION).bitor(WS_THICKFRAME));
        SetWindowLongPtrW(hwnd, GWL_STYLE, new_style.0 as isize);
    })
}

pub(super) async fn reparent(state: &Arc<AppState>, mpv_wid: usize, parent_wid: usize) -> Result<()> {
    let mpv = id2hwnd(mpv_wid);
    let parent = id2hwnd(parent_wid);
    Ok(unsafe {
        SetParent(mpv, parent)?;
    })
}

pub async fn reposition(state: &Arc<AppState>, mpv_wid: usize, container_rect: &HtmlElementRect) -> Result<()> {
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

pub(super) fn unparent(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let hwnd = id2hwnd(mpv_wid);
    Ok(unsafe {
        SetParent(hwnd, HWND::default())?;
    })
}

pub(super) async fn focus(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let hwnd = id2hwnd(mpv_wid);
    Ok(unsafe {
        let _ = SetForegroundWindow(hwnd);
        SetWindowPos(hwnd, HWND_TOP, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE)?;
    })
}

pub async fn pid2wid(state: &Arc<AppState>, pid: u32) -> Result<Option<usize>> {
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

fn id2hwnd(mpv_id: usize) -> HWND {
    HWND(mpv_id as *mut c_void)
}