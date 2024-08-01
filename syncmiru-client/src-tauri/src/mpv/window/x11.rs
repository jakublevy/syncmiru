use std::collections::VecDeque;
use std::sync::Arc;
use tokio::time::sleep;
use std::time::Duration;
use windows::Win32::UI::WindowsAndMessaging::{ShowWindow, SW_MAXIMIZE};
use x11rb::connection::Connection;
use x11rb::rust_connection::RustConnection;
use crate::appstate::AppState;
use crate::mpv::window::HtmlElementRect;
use crate::result::Result;
use x11rb::protocol::xproto;
use x11rb::protocol::xproto::{ConfigureWindowAux, ConnectionExt, InputFocus};
use x11rb::wrapper::ConnectionExt as OtherConnectionExt;

pub async fn init_connection(state: &Arc<AppState>) -> Result<()> {
    let (conn, _) = RustConnection::connect(None)?;
    let mut x11_conn_wl = state.x11_conn.write().await;
    *x11_conn_wl = Some(conn);
    Ok(())
}

pub(super) async fn hide_borders(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    let motif_hints = [2, 0, 0, 0, 0];
    set_decoration(conn, mpv_window, &motif_hints)?;
    Ok(())
}

pub(super) async fn show_borders(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    let motif_hints = [2, 0, 1, 0, 0];
    set_decoration(conn, mpv_window, &motif_hints)?;
    Ok(())
}

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
    }
}

pub(super) async fn maximize(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    let screen = &conn.setup().roots[screen_num];


    let wm_state = conn.intern_atom(false, b"_NET_WM_STATE")?.reply()?.atom;
    let wm_state_max_horz = conn.intern_atom(false, b"_NET_WM_STATE_MAXIMIZED_HORZ")?.reply()?.atom;
    let wm_state_max_vert = conn.intern_atom(false, b"_NET_WM_STATE_MAXIMIZED_VERT")?.reply()?.atom;

    let data = ClientMessageData::from_data32([
        1,
        wm_state_max_horz,
        wm_state_max_vert,
        0,
        0,
    ]);
    let event = ClientMessageEvent {
        response_type: x11rb::protocol::xproto::CLIENT_MESSAGE_EVENT,
        format: 32,
        sequence: 0,
        window,
        type_: wm_state,
        data,
    };
    
    conn.send_event(
        false,
        window,
        EventMask::STRUCTURE_NOTIFY | EventMask::SUBSTRUCTURE_REDIRECT,
        event,
    )?;
    conn.flush()?;
}

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

pub async fn focus(state: &Arc<AppState>, mpv_wid: usize) -> Result<()> {
    let conn_rl = state.x11_conn.read().await;
    let conn = conn_rl.as_ref().unwrap();
    let mpv_window = id2window(mpv_wid);

    conn.set_input_focus(InputFocus::PARENT, mpv_window, x11rb::CURRENT_TIME)?.check()?;
    Ok(())
}

fn set_decoration(conn: &RustConnection, window: xproto::Window, motif_hints: &[u32; 5]) -> Result<()> {
    let motif_hints_atom = conn.intern_atom(false, "_MOTIF_WM_HINTS".as_ref())?.reply()?.atom;

    let change_prop_cookie = conn.change_property32(
        xproto::PropMode::REPLACE,
        window,
        motif_hints_atom,
        motif_hints_atom,
        motif_hints
    )?;
    change_prop_cookie.check()?;
    Ok(())
}

fn set_position(conn: &RustConnection, window: xproto::Window, x: i32, y: i32) -> Result<()> {
    let cfg = ConfigureWindowAux::new().x(x).y(y);
    conn.configure_window(window, &cfg)?.check()?;
    Ok(())
}

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

struct WindowWalker<'a> {
    conn: &'a RustConnection,
    win_queue: VecDeque<xproto::Window>,
}

impl<'a> WindowWalker<'a> {
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

fn get_window_property(
    conn: &RustConnection,
    window: xproto::Window,
    property: xproto::Atom
) -> Result<xproto::GetPropertyReply> {
    let prop = conn.get_property(false, window, property, xproto::AtomEnum::CARDINAL, 0, 1024)?.reply()?;
    Ok(prop)
}

fn get_root_window(conn: &RustConnection) -> xproto::Window {
    conn.setup().roots[0].root
}

fn id2window(mpv_id: usize) -> xproto::Window {
    mpv_id as xproto::Window
}