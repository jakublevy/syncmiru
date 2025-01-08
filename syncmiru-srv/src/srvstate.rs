//! This module defines the runtime state of the server and its associated functionality.

use std::collections::{HashMap, HashSet};
use std::ops::Deref;
use rust_decimal::Decimal;
use rust_decimal::prelude::ToPrimitive;
use serde::{Deserialize, Serialize};
use serde_repr::Serialize_repr;
use socketioxide::extract::SocketRef;
use socketioxide::socket::Sid;
use socketioxide::SocketIo;
use sqlx::{PgPool};
use tokio::sync::{RwLock};
use tokio::sync::mpsc::Sender;
use tokio::time::Instant;
use crate::bimultimap::BiMultiMap;
use crate::config::Config;
use crate::handlers::timers::DesyncTimerInterface;
use crate::models::query::{Id, RoomSettings};

pub type PlaylistEntryId = u64;


/// Main server state, holding various data structures to manage user sessions, playlists, and synchronization.
pub struct SrvState {
    /// Configuration settings for the server, loaded from the `config.yaml` by default
    pub config: Config,

    /// The database pool used for interacting with the PostgreSQL database
    pub db: PgPool,

    /// Sender for the desynchronization timer interface.
    /// It is used to wake or sleep the timer that manages the desychronization of clients.
    pub desync_timer_tx: Sender<DesyncTimerInterface>,

    /// A bi-directional map that associates a `Sid` (Socket ID) with a `User ID` (`Id`).
    /// This mapping allows the server to look up the `User ID` of a socket and vice versa.
    pub socket_uid: RwLock<bimap::BiMap<Sid, Id>>,

    /// A map that tracks socket IDs (`Sid`) and their corresponding user IDs (`Id`) for sockets
    /// that forcefully got disconnected.
    pub socket_uid_disconnect: RwLock<HashMap<Sid, Id>>,

    /// A mapping between socket IDs (`Sid`) and their corresponding hardware ID hashes (`String`).
    /// This is used for identifying the device or machine a socket is connected to.
    pub sid_hwid_hash: RwLock<HashMap<Sid, String>>,

    /// A Socket.IO server instance.
    /// This enables communication with connected clients via the Socket.IO protocol.
    pub io: RwLock<Option<SocketIo>>,

    /// A bi-directional map that maps room IDs (`Id`) to user IDs (`Id`).
    /// This helps track which users belong to which rooms.
    pub rid_uids: RwLock<BiMultiMap<Id, Id>>,

    /// A map that stores the ping times (`f64`) for each user by their user ID (`Id`).
    /// This is useful for calculating latency and synchronizing users based on network conditions.
    pub uid_ping: RwLock<HashMap<Id, f64>>,

    /// A read-write lock for managing the next playlist entry ID (`PlaylistEntryId`).
    /// This is incremented each time a new playlist entry is added.
    pub playlist_entry_next_id: RwLock<PlaylistEntryId>,

    /// A map that stores playlist entries, where each entry is identified by a unique `PlaylistEntryId`.
    /// This allows the server to associate which entry belongs to a room and track the current playlist.
    pub playlist: RwLock<HashMap<PlaylistEntryId, PlaylistEntry>>,

    /// A bi-directional map that associates room IDs (`Id`) with playlist entry IDs (`PlaylistEntryId`).
    /// This helps track which video or media entry is associated with each room.
    pub rid_video_id: RwLock<BiMultiMap<Id, PlaylistEntryId>>,

    /// A map that stores runtime state for each room by room ID (`Id`).
    /// It includes playback speed and room-specific settings, allowing room behavior to be customized.
    pub rid2runtime_state: RwLock<HashMap<Id, RoomRuntimeState>>,

    /// A map that stores play information for each room by room ID (`Id`).
    /// This includes information like the current video being played and the room's playback state.
    pub rid2play_info: RwLock<HashMap<Id, RoomPlayInfo>>,

    /// A map that tracks the readiness status of each user by their user ID (`Id`).
    /// This can include statuses like `Ready`, `NotReady`, `Loading`, and `Error`, which indicate whether
    /// the user is prepared for playback or not.
    pub uid2ready_status: RwLock<HashMap<Id, UserReadyStatus>>,

    /// A map that stores audio/subtitle related information for each user by their user ID (`Id`).
    /// This includes synchronization flags and delay settings for audio and subtitles.
    pub uid2play_info: RwLock<HashMap<Id, UserPlayInfo>>,

    /// A map that stores timestamp information for each user by their user ID (`Id`).
    /// This is used to track the current position of a client.
    pub uid2timestamp: RwLock<HashMap<Id, TimestampInfo>>,

    /// A set that tracks users (`Id`) who are currently experiencing minor desynchronization.
    /// This is used to flag users who are slightly out of sync with the video and are adjusting.
    pub uid2minor_desync: RwLock<HashSet<Id>>
}

impl SrvState {
    /// Maps a socket reference to a user ID (UID).
    ///
    /// # Arguments
    /// * `s` - The socket reference to retrieve the user ID from.
    ///
    /// # Returns
    /// A user ID (`Id`) associated with the socket.
    pub async fn socket2uid(&self, s: &SocketRef) -> Id {
        let socket_uid_lock = self.socket_uid.read().await;
        *socket_uid_lock.get_by_left(&s.id).unwrap()
    }


    /// Maps a user ID (UID) to a socket ID (Sid).
    ///
    /// # Arguments
    /// * `uid` - The user ID to map to a socket ID.
    ///
    /// # Returns
    /// An `Option` containing the socket ID (`Sid`) associated with the user ID.
    pub async fn uid2sid(&self, uid: Id) -> Option<Sid> {
        let socket_uid_lock = self.socket_uid.read().await;
        socket_uid_lock.get_by_right(&uid).map(|x|x.clone())
    }


    /// Retrieves the hardware ID hash associated with a socket.
    ///
    /// # Arguments
    /// * `s` - The socket reference to retrieve the hardware ID hash for.
    ///
    /// # Returns
    /// A `String` containing the hardware ID hash associated with the socket.
    pub async fn socket2hwid_hash(&self, s: &SocketRef) -> String {
        let sid_hwid_hash_rl = self.sid_hwid_hash.read().await;
        sid_hwid_hash_rl.get(&s.id).map(|x| x.clone()).unwrap()
    }


    /// Retrieves the room ID that a socket is connected to.
    ///
    /// # Arguments
    /// * `s` - The socket reference to check.
    ///
    /// # Returns
    /// An `Option` containing the room ID (`Id`) the socket is connected to, or `None` if not connected.
    pub async fn socket_connected_room(&self, s: &SocketRef) -> Option<Id> {
        let rooms = s.rooms().expect("socketio error");
        if rooms.is_empty() {
            None
        }
        else {
            let joined_room = rooms.get(0).unwrap();
            joined_room.parse::<Id>().ok()
        }
    }


    /// Retrieves the next available playlist entry ID.
    ///
    /// # Returns
    /// A `PlaylistEntryId` that can be used for the next playlist entry.
    pub async fn next_playlist_entry_id(&self) -> PlaylistEntryId {
        let mut wl = self.playlist_entry_next_id.write().await;
        let ret_id = wl.clone();
        *wl = ret_id + 1;
        ret_id
    }


    /// Clears the `uid2play_info` information for all users in a room.
    ///
    /// # Arguments
    /// * `rid` - The room ID for which to clear the user play information.
    pub async fn clear_uid2play_info_by_rid(&self, rid: Id) {
        let mut uid2play_info_wl = self.uid2play_info.write().await;
        let rid_uids_rl = self.rid_uids.read().await;
        let uids = rid_uids_rl.get_by_left(&rid).unwrap();
        for uid in uids {
            uid2play_info_wl.remove(uid);
        }
    }


    /// Removes a video entry from the playlist.
    ///
    /// # Arguments
    /// * `entry_id` - The playlist entry ID to remove.
    pub async fn remove_video_entry(&self, entry_id: PlaylistEntryId) {
        let mut playlist_wl = self.playlist.write().await;
        let mut rid_video_id_wl = self.rid_video_id.write().await;

        rid_video_id_wl.remove_by_right(&entry_id);
        playlist_wl.remove(&entry_id);

        if playlist_wl.is_empty() {
            self.desync_timer_tx.send(DesyncTimerInterface::Sleep).await.ok();
        }
    }


    /// Checks if the user's file is fully loaded.
    ///
    /// # Arguments
    /// * `uid` - The user ID to check for file readiness.
    ///
    /// # Returns
    /// A `bool` indicating whether the user's file is loaded.
    pub async fn user_file_loaded(&self, uid: Id) -> bool {
        let uid2ready_status_rl = self.uid2ready_status.read().await;
        if let Some(ready_status) = uid2ready_status_rl.get(&uid) {
            *ready_status == UserReadyStatus::Ready || *ready_status == UserReadyStatus::NotReady
        }
        else {
            false
        }
    }


    /// Calculates the compensated timestamp for a user's playback, considering various synchronization
    /// factors such as ping, playback speed, etc.
    ///
    /// # Arguments
    /// * `uid` - The user ID for which to calculate the compensated timestamp.
    /// * `rid` - The room ID for which to calculate the timestamp.
    /// * `uid2timestamp_rl` - Read lock of the `uid2timestamp` hashmap containing timestamp information.
    /// * `rid2play_info_rl` - Read lock of the `rid2play_info` hashmap containing room play information.
    /// * `uid_ping_rl` - Read lock of the `uid_ping` hashmap containing user ping times.
    /// * `rid2runtime_state_rl` - Read lock of the `rid2runtime_state` hashmap containing room runtime state.
    ///
    /// # Returns
    /// An `Option<f64>` containing the compensated timestamp, or `None` if synchronization cannot be calculated.
    pub fn get_compensated_timestamp_of_uid<'a, A, B, C, D>(
        &self,
        uid: Id,
        rid: Id,
        uid2timestamp_rl: &A,
        rid2play_info_rl: &B,
        uid_ping_rl: &C,
        rid2runtime_state_rl: &D
    ) -> Option<f64>
    where
        A: Deref<Target = HashMap<Id, TimestampInfo>>,
        B: Deref<Target = HashMap<Id, RoomPlayInfo>>,
        C: Deref<Target = HashMap<Id, f64>>,
        D: Deref<Target = HashMap<Id, RoomRuntimeState>>
    {
        let timestamp_info_opt = uid2timestamp_rl.get(&uid);
        if timestamp_info_opt.is_none() {
            return None
        }
        let play_info_opt = rid2play_info_rl.get(&rid);
        if play_info_opt.is_none() {
            return None
        }
        let play_info = play_info_opt.unwrap();
        let timestamp_info = timestamp_info_opt.unwrap();
        let mut compensated_timestamp = timestamp_info.timestamp;
        if play_info.playing_state == PlayingState::Play {
            let mut compensation_start = play_info.last_change_at;
            if play_info.last_change_at < timestamp_info.recv {
                compensation_start = timestamp_info.recv;
            }
            let duration = Instant::now().duration_since(compensation_start);
            let room_runtime_state = rid2runtime_state_rl.get(&rid).unwrap();
            let ping_ms = *uid_ping_rl.get(&uid).unwrap_or(&0f64);

            compensated_timestamp +=
                duration.as_secs_f64() * room_runtime_state.playback_speed.to_f64().unwrap()
                + (ping_ms / 1000f64);

            Some(compensated_timestamp)
        }
        else {
            Some(compensated_timestamp)
        }
    }


    /// Clears the minor desynchronization status for all users in a room.
    ///
    /// # Arguments
    /// * `rid` - The room ID for which to clear the minor desync status.
    pub async fn clear_minor_desync_uids_for_rid(&self, rid: Id) {
        let mut uid2minor_desync_wl = self.uid2minor_desync.write().await;
        let rid_uids_rl = self.rid_uids.read().await;
        if let Some(uids) = rid_uids_rl.get_by_left(&rid) {
            for uid in uids {
                uid2minor_desync_wl.remove(uid);
            }
        }
    }
}

/// Represents an entry in the playlist, either a video from a source or a direct URL.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum PlaylistEntry {
    Video { source: String, path: String },
    Url { url: String }
}


/// Stores play information for a room
#[derive(Debug)]
pub struct RoomPlayInfo {
    /// Currently playing entry id
    pub playing_entry_id: PlaylistEntryId,

    /// Current state (Play or Pause)
    pub playing_state: PlayingState,

    /// The timestamp of the last state change.
    /// This represents the exact time when the state was last modified.
    pub last_change_at: Instant
}


/// Stores runtime state information for a room, such as playback speed and room settings.
#[derive(Debug)]
pub struct RoomRuntimeState {
    /// Current playback speed
    pub playback_speed: Decimal,

    /// Current runtime room configuration
    pub runtime_config: RoomSettings,
}


/// Enum representing the play state of a video (Play or Pause).
#[derive(Debug, Copy, Clone, PartialEq, Serialize_repr)]
#[repr(u8)]
pub enum PlayingState {
    Play = 0,
    Pause = 1
}


/// Stores user-specific playback information.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct UserPlayInfo {
    /// Audio track id
    pub aid: Option<u64>,

    /// Subtitle track id
    pub sid: Option<u64>,

    /// Whether audio track is synchronized
    pub audio_sync: bool,

    /// Whether subtitle track is synchronized
    pub sub_sync: bool,

    /// Whether audio delay is synchronized
    pub audio_delay: f64,

    /// Whether subtitle delay is synchronized
    pub sub_delay: f64,
}


/// Enum representing the readiness status of a user.
#[derive(Debug, Copy, Clone, PartialEq, Serialize, Deserialize)]
pub enum UserReadyStatus {
    Ready, NotReady, Loading, Error
}


/// Contains timestamp information for user synchronization, including the timestamp and the received time.
#[derive(Debug, Copy, Clone)]
pub struct TimestampInfo {
    pub timestamp: f64,
    pub recv: Instant
}