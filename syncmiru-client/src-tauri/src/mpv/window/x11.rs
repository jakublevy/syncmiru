//! This module provides utility functions to interact with mpv window on a Linux platforms
//! using X11 calls.

use std::collections::VecDeque;
use std::sync::Arc;
use tokio::time::sleep;
use std::time::Duration;
use tokio::sync::RwLock;
use x11rb::connection::Connection;
use x11rb::rust_connection::RustConnection;
use crate::appstate::AppState;
use crate::mpv::window::HtmlElementRect;
use crate::result::Result;
use x11rb::protocol::xproto;
use x11rb::protocol::xproto::{ChangeWindowAttributesAux, ClientMessageData, ClientMessageEvent, ConfigureWindowAux, ConnectionExt, EventMask, InputFocus};
use x11rb::resource_manager::new_from_default;
use x11rb::wrapper::ConnectionExt as OtherConnectionExt;
use crate::constants;


/// Initializes the X11 connection and stores it in the provided app state.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection and screen number.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
pub async fn init_connection(state: &Arc<AppState>) -> Result<()> {
    let (conn, screen_num) = RustConnection::connect(None)?;
    let mut x11_conn_wl = state.x11_conn.write().await;
    let mut x11_screen_num = state.x11_screen_num.write().await;
    *x11_conn_wl = Some(conn);
    *x11_screen_num = Some(screen_num);
    Ok(())
}

/// Hides the borders of the mpv window by modifying its decoration hints.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
/// * `mpv_wid` - The window ID of the mpv window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
pub(super) async fn hide_borders(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    let motif_hints = [2, 0, 0, 0, 0];
    set_decoration(conn, mpv_window, &motif_hints)?;
    Ok(())
}

/// Shows the borders of the mpv window by modifying its decoration hints.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
/// * `mpv_wid` - The window ID of the mpv window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
pub(super) async fn show_borders(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    let motif_hints = [2, 0, 1, 0, 0];
    set_decoration(conn, mpv_window, &motif_hints)?;
    Ok(())
}

/// Reparents the mpv window to a new parent window.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
/// * `mpv_wid` - The window ID of the mpv window.
/// * `parent_wid` - The window ID of the new parent window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
pub(super) async fn reparent(state: &Arc<AppState>, mpv_wid: usize, parent_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);
    let parent_window = id2window(parent_wid);

    loop {
        conn.reparent_window(mpv_window, parent_window, 100, 100)?;
        let reply = conn.query_tree(mpv_window)?.reply()?;
        if reply.parent == parent_window {
            return Ok(())
        }
        sleep(Duration::from_millis(10)).await;
    }
}


/// Maximizes the mpv window by sending the appropriate window state message.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
/// * `mpv_wid` - The window ID of the mpv window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
pub(super) async fn maximize(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    let wm_state = conn.intern_atom(false, b"_NET_WM_STATE")?.reply()?.atom;
    let wm_state_max_horz = conn.intern_atom(false, b"_NET_WM_STATE_MAXIMIZED_HORZ")?.reply()?.atom;
    let wm_state_max_vert = conn.intern_atom(false, b"_NET_WM_STATE_MAXIMIZED_VERT")?.reply()?.atom;

    let data = ClientMessageData::from([
        1,
        wm_state_max_horz,
        wm_state_max_vert,
        0,
        0,
    ]);
    let event = ClientMessageEvent {
        response_type: xproto::CLIENT_MESSAGE_EVENT,
        format: 32,
        sequence: 0,
        window: mpv_window,
        type_: wm_state,
        data,
    };

    conn.send_event(
        false,
        mpv_window,
        EventMask::STRUCTURE_NOTIFY | EventMask::SUBSTRUCTURE_REDIRECT,
        event,
    )?;
    conn.flush()?;
    Ok(())
}


/// Repositions the mpv window based on the given container rectangle.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
/// * `mpv_wid` - The window ID of the mpv window.
/// * `container_rect` - The rectangle specifying the new position and size of the mpv window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
pub async fn reposition(state: &Arc<AppState>, mpv_wid: usize, container_rect: &HtmlElementRect) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    let cfg = ConfigureWindowAux::new()
        .x(container_rect.x.round() as i32)
        .y(container_rect.y.round() as i32)
        .width(container_rect.width.round() as u32)
        .height(container_rect.height.round() as u32);

    conn.configure_window(mpv_window, &cfg)?.check()?;
    Ok(())
}


/// Sets the default cursor for the mpv window.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
/// * `mpv_wid` - The window ID of the mpv window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
pub async fn set_default_cursor(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);
    let x11_screen_num_rl = state.x11_screen_num.read().await;
    let x11_screen_num = x11_screen_num_rl.unwrap();

    let cursor_context = x11rb::cursor::Handle::new(
        conn,
        x11_screen_num,
        &x11rb::resource_manager::new_from_default(conn)?
    )?.reply()?;

    let cursor = cursor_context.load_cursor(conn, "default")?;
    conn.change_window_attributes(mpv_window, &ChangeWindowAttributesAux::new().cursor(cursor))?;
    Ok(())
}


/// Unparents the mpv window and repositions it to the root window.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
/// * `mpv_wid` - The window ID of the mpv window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
pub(super) async fn unparent(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    let mpv_reply = conn.query_tree(mpv_window)?.reply()?;
    let parent_window = mpv_reply.parent;
    let parent_reply = conn.query_tree(parent_window)?.reply()?;
    let root = parent_reply.root;

    let child_to_old_parent = conn.translate_coordinates(mpv_window, parent_window, 0, 0)?.reply()?;
    let old_parent_to_root = conn.translate_coordinates(parent_window, root, 0, 0)?.reply()?;

    let new_child_x = child_to_old_parent.dst_x + old_parent_to_root.dst_y;
    let new_child_y = child_to_old_parent.dst_y + old_parent_to_root.dst_y;

    reparent(state, mpv_window as usize, root as usize).await?;
    set_position(conn, mpv_window, new_child_x as i32, new_child_y as i32)?;

    Ok(())
}


/// Focuses the mpv window.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
/// * `mpv_wid` - The window ID of the mpv window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
pub async fn focus(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    conn.set_input_focus(InputFocus::PARENT, mpv_window, x11rb::CURRENT_TIME)?.check()?;
    Ok(())
}


/// Retrieves the scale factor of the display.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
///
/// # Returns
/// * `Result<f64>` - Returns the scale factor as a floating-point number.
pub async fn get_scale_factor(state: &Arc<AppState>) -> Result<f64> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    Ok(crate::x11::get_scale_factor(conn)?)
}


/// Helper function to set the decoration hints for a given window.
///
/// # Arguments
/// * `conn` - The X11 connection.
/// * `window` - The window ID of the target window.
/// * `motif_hints` - The motif window manager hints to set for the window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
fn set_decoration(conn: &RustConnection, window: xproto::Window, motif_hints: &[u32; 5]) -> Result<()> {
    let motif_hints_atom = conn.intern_atom(false, "_MOTIF_WM_HINTS".as_ref())?.reply()?.atom;

    let change_prop_cookie = conn.change_property32(
        xproto::PropMode::REPLACE,
        window,
        motif_hints_atom,
        motif_hints_atom,
        motif_hints,
    )?;
    change_prop_cookie.check()?;
    Ok(())
}


/// Helper function to set the position of a window.
///
/// # Arguments
/// * `conn` - The X11 connection.
/// * `window` - The window ID of the target window.
/// * `x` - The x-coordinate to move the window.
/// * `y` - The y-coordinate to move the window.
///
/// # Returns
/// * `Result<()>` - Returns a result indicating success or failure.
fn set_position(conn: &RustConnection, window: xproto::Window, x: i32, y: i32) -> Result<()> {
    let cfg = ConfigureWindowAux::new().x(x).y(y);
    conn.configure_window(window, &cfg)?.check()?;
    Ok(())
}


/// Retrieves the window ID for a given process ID.
///
/// # Arguments
/// * `state` - The application state holding the X11 connection.
/// * `pid` - The process ID to look up.
///
/// # Returns
/// * `Result<Option<usize>>` - Returns the window ID of the process if found.
pub async fn pid2wid(state: &Arc<AppState>, pid: u32) -> Result<Option<usize>> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();

    let net_wm_pid = conn.intern_atom(false, b"_NET_WM_PID")?.reply()?.atom;

    let mut found_window: Option<usize> = None;
    while found_window.is_none() {
        let walker = WindowWalker::new(conn);
        for window in walker {
            if let Ok(prop) = get_window_property(conn, window, net_wm_pid) {
                if let Some(mut value) = prop.value32() {
                    if value.any(|v| v == pid) {
                        return Ok(Some(window as usize));
                    }
                }
            }
        }
        sleep(Duration::from_millis(10)).await;
    }
    Ok(None)
}

/// Helper struct to walk through all windows in the X11 session.
struct WindowWalker<'a> {
    conn: &'a RustConnection,
    win_queue: VecDeque<xproto::Window>,
}

impl<'a> WindowWalker<'a> {
    /// Creates a new WindowWalker instance starting at the root window.
    fn new(conn: &'a RustConnection) -> Self {
        let root = get_root_window(conn);
        let mut win_queue = VecDeque::new();
        win_queue.push_back(root);
        WindowWalker { conn, win_queue }
    }
}

impl<'a> Iterator for WindowWalker<'a> {
    type Item = xproto::Window;

    fn next(&mut self) -> Option<Self::Item> {
        if let Some(main) = self.win_queue.pop_front() {
            if let Ok(query_tree_r) = self.conn.query_tree(main).and_then(|q| Ok(q.reply())) {
                if let Ok(query_tree) = query_tree_r {
                    for child in query_tree.children {
                        self.win_queue.push_back(child);
                    }
                }
            }
            Some(main)
        } else {
            None
        }
    }
}

/// Helper function to get a property value for a window.
///
/// # Arguments
/// * `conn` - The X11 connection.
/// * `window` - The window ID of the target window.
/// * `property` - The property atom to retrieve.
///
/// # Returns
/// * `Result<xproto::GetPropertyReply>` - Returns the property value if found.
fn get_window_property(
    conn: &RustConnection,
    window: xproto::Window,
    property: xproto::Atom,
) -> Result<xproto::GetPropertyReply> {
    let prop = conn.get_property(false, window, property, xproto::AtomEnum::CARDINAL, 0, 1024)?.reply()?;
    Ok(prop)
}

/// Helper function to get the root window for the X11 connection.
///
/// # Arguments
/// * `conn` - The X11 connection.
///
/// # Returns
/// * `xproto::Window` - Returns the root window ID.
fn get_root_window(conn: &RustConnection) -> xproto::Window {
    conn.setup().roots[0].root
}


/// Helper function to convert a usize ID to a window handle.
///
/// # Arguments
/// * `mpv_id` - The window ID as usize.
///
/// # Returns
/// * `xproto::Window` - The corresponding window handle.
fn id2window(mpv_id: usize) -> xproto::Window {
    mpv_id as xproto::Window
}