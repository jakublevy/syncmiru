//! This module defines the `AppState` structure and its associated functionality.

use std::collections::HashMap;
use tokio::sync::{RwLock};
use tokio::sync::mpsc;
use tokio::time::Instant;
use crate::config::appdata::AppData;
use crate::mpv;
use crate::result::Result;

#[cfg(target_family = "unix")]
use x11rb::rust_connection::RustConnection;

/// Represents the runtime state of the application.
#[derive(Debug)]
pub struct AppState {
    /// Persistent configuration and runtime data
    pub appdata: RwLock<AppData>,

    /// The window ID of mpv
    pub mpv_wid: RwLock<Option<usize>>,

    /// A channel used to signal the termination of mpv process
    pub mpv_stop_tx: RwLock<Option<tokio::sync::oneshot::Sender<()>>>,

    /// A channel used to send IPC commands to mpv
    pub mpv_ipc_tx: RwLock<Option<mpsc::Sender<mpv::ipc::Interface>>>,

    /// A flag indicating whether to reattach the mpv window when exiting fullscreen
    pub mpv_reattach_on_fullscreen_false: RwLock<bool>,

    /// The next available request ID for mpv IPC communication
    pub mpv_next_req_id: RwLock<u32>,

    /// A map storing response senders for mpv IPC requests, keyed by request ID
    pub mpv_response_senders: RwLock<HashMap<u32, mpsc::Sender<serde_json::Value>>>,

    /// Timestamp to ignore fullscreen events for a specific duration
    pub mpv_ignore_fullscreen_events_timestamp: RwLock<Instant>,

    /// Flag to ignore the next pause event
    pub mpv_ignore_next_pause_true_event: RwLock<bool>,

    /// Flag to ignore the next unpause event
    pub mpv_ignore_next_pause_false_event: RwLock<bool>,

    /// Flag to ignore the seek event
    pub mpv_ignore_next_seek_event: RwLock<bool>,

    /// Id of "Not ready" message shown in mpv
    pub mpv_not_ready_msg_id: RwLock<Option<u32>>,

    /// Id of loading message shown in mpv
    pub mpv_loading_msg_id: RwLock<Option<u32>>,

    /// Id of "everyone ready" message shown in mpv
    pub mpv_everyone_ready_msg_id: RwLock<Option<u32>>,

    /// Ids of neutral messages shown in mpv
    pub mpv_neutral_msgs: RwLock<Vec<MpvMsg>>,

    /// Flag to ignore the next speed event
    pub mpv_ignore_next_speed_event: RwLock<bool>,

    /// Flag to ignore the next audio change event
    pub mpv_ignore_next_audio_change_event: RwLock<bool>,

    /// Flag to ignore the next subtitle change event
    pub mpv_ignore_next_sub_change_event: RwLock<bool>,

    /// Flag to ignore the next audio delay event
    pub mpv_ignore_next_audio_delay_event: RwLock<bool>,

    /// Flag to ignore the next subtitle delay event
    pub mpv_ignore_next_sub_delay_event: RwLock<bool>,

    /// X11 connection for Unix systems
    #[cfg(target_family = "unix")]
    pub x11_conn: RwLock<Option<RustConnection>>,

    /// Screen number for X11 on Unix systems
    #[cfg(target_family = "unix")]
    pub x11_screen_num: RwLock<Option<usize>>
}

impl AppState {

    /// Reads the home server URL from the application's configuration.
    ///
    /// If the URL is not set, an empty string is returned.
    ///
    /// # Returns
    /// A `Result<String>` containing the home server URL as a `String`.
    pub async fn read_home_srv(&self) -> Result<String> {
        let appdata_lock = self.appdata.read().await;
        let home_srv = appdata_lock.home_srv.clone().unwrap_or("".to_string());
        Ok(home_srv)
    }


    /// Retrieves the next request ID for `mpv` IPC communication.
    ///
    /// This increments the request ID counter and returns the previous value.
    ///
    /// # Returns
    /// The next request ID as a `u32`.
    pub async fn get_mpv_next_req_id(&self) -> u32 {
        let mut mpv_next_req_id_wl = self.mpv_next_req_id.write().await;
        let req_id = *mpv_next_req_id_wl;
        *mpv_next_req_id_wl = *mpv_next_req_id_wl + 1;
        req_id
    }
}

/// Represents a message associated with mpv, including its ID, timestamp, and duration.
///
/// This is used to track and display transient messages, such as informational or
/// status updates, during media playback.
#[derive(Debug, Copy, Clone)]
pub struct MpvMsg {
    /// The unique identifier for the message
    pub id: u32,

    /// The timestamp indicating when the message was created
    pub timestamp: Instant,

    /// The duration for which the message should be displayed, in seconds
    pub duration: f64
}

impl MpvMsg {
    /// Checks whether the message is still within its display duration.
    ///
    /// # Returns
    /// `true` if the message should still be shown; otherwise, `false`.
    pub fn is_shown(&self) -> bool {
        Instant::now().duration_since(self.timestamp).as_secs_f64() < self.duration
    }
}