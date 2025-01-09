//! This module defines the models used for Socket.IO communication.

use std::collections::HashMap;
use indexmap::{IndexMap, IndexSet};
use rust_decimal::Decimal;
use serde::{Serialize, Deserialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use validator::Validate;
use crate::validators;
use crate::models::query::{Id, RoomSettings};
use crate::srvstate::{PlayingState, PlaylistEntry, PlaylistEntryId, UserPlayInfo, UserReadyStatus};


/// Represents login tokens used for authentication.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct LoginTkns {
    /// Hardware ID hash, required to be exactly 64 characters
    #[validate(length(equal = 64))]
    pub hwid_hash: String,

    /// JWT for user authentication, required to be non-empty
    #[validate(length(min = 1))]
    pub jwt: String
}


/// Represents a structure containing a single ID.
#[derive(Debug, Copy, Clone, Deserialize, Validate)]
pub struct IdStruct {
    /// A unique identifier
    #[validate(range(min = 1))]
    pub id: Id
}

/// Represents a user's display name.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Displayname {
    /// The display name of the user
    #[validate(custom(function = "validators::check_displayname_format"))]
    pub displayname: String,
}


/// Represents a change in a user's display name.
#[derive(Debug, Clone, Serialize)]
pub struct DisplaynameChange {
    /// The unique identifier of the user
    pub uid: Id,

    /// The new display name of the user
    pub displayname: String
}


/// Represents a token used for changing email addresses.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct EmailChangeTkn {
    /// Token for email change
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    /// The type of email change token (`From` or `To`).
    pub tkn_type: EmailChangeTknType
}


/// Enumerates the types of email change tokens.
#[derive(Debug, Copy, Clone, PartialEq, Deserialize_repr)]
#[repr(u8)]
pub enum EmailChangeTknType {
    /// Token for the current email address
    From = 0,

    /// Token for the new email address
    To = 1
}


/// Represents the details required to change an email address.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct ChangeEmail {
    /// Token for the current email address
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn_from: String,

    /// Token for the new email address
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn_to: String,

    /// The new email address
    #[validate(email, length(max = 320))]
    pub email_new: String,


    /// Language preference
    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}


/// Represents binary avatar data
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct AvatarBin {
    /// Binary data of the avatar
    #[validate(custom(function = "validators::check_avatar"))]
    pub data: Vec<u8>
}

/// Represents a change in a user's avatar.
#[derive(Debug, Clone, Serialize)]
pub struct AvatarChange {
    /// The unique identifier of the user
    pub uid: Id,

    /// The new avatar binary data
    pub avatar: Vec<u8>
}


/// Represents a user's password.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Password {
    /// The password
    #[validate(custom(function = "validators::check_password_format"))]
    pub password: String
}


/// Represents a request to change a user's password.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct ChangePassword {
    /// The old password
    #[validate(custom(function = "validators::check_password_format"))]
    pub old_password: String,

    /// The new password
    #[validate(custom(function = "validators::check_password_format"))]
    pub new_password: String,

    /// Language preference
    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}


/// Represents a language preference.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Language {
    /// The language code
    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}


/// Represents a token and language combination.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct TknWithLang {
    /// The token
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    /// The language code
    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}


/// Struct representing the data required to create a registration token.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RegTknCreate {
    /// The name of the registration token
    #[validate(custom(function = "validators::check_reg_tkn_name"))]
    pub reg_tkn_name: String,

    /// The maximum number of registrations allowed for this token
    #[validate(custom(function = "validators::check_reg_tkn_max_regs"))]
    pub max_regs: Option<i32>
}


/// Struct representing the name of a registration token.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RegTknName {
    /// The name of the registration token
    #[validate(custom(function = "validators::check_reg_tkn_name"))]
    pub reg_tkn_name: String,
}


/// Struct representing the playback speed settings.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct PlaybackSpeed {
    /// The playback speed value
    #[validate(custom(function = "validators::check_playback_speed"))]
    pub playback_speed: Decimal
}


/// Struct representing the maximum allowed desynchronization value.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct DesyncTolerance {
    /// The desynchronization tolerance value
    #[validate(custom(function = "validators::check_desync_tolerance"))]
    pub desync_tolerance: Decimal
}


/// Struct representing the minimum tolerance for major desynchronization.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct MajorDesyncMin {
    /// The playback slowdown value for minor desynchronization
    #[validate(custom(function = "validators::check_major_desync_min"))]
    pub major_desync_min: Decimal
}



#[derive(Debug, Clone, Deserialize, Validate)]
pub struct MinorDesyncPlaybackSlow {
    #[validate(custom(function = "validators::check_minor_desync_playback_slow"))]
    pub minor_desync_playback_slow: Decimal
}


/// Struct representing a room name.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RoomName {
    /// The name of the room
    #[validate(custom(function = "validators::check_room_name"))]
    pub room_name: String,
}


/// Struct representing a request to change the room's name.
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomNameChange {
    /// The ID of the room to be renamed
    #[validate(range(min = 1))]
    pub rid: Id,

    /// The new name for the room
    #[validate(custom(function = "validators::check_room_name"))]
    pub room_name: String
}


/// Struct representing the playback speed for a room.
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomPlaybackSpeed {
    /// The unique identifier for the room
    #[validate(range(min = 1))]
    pub id: Id,

    /// The playback speed for the room
    #[validate(custom(function = "validators::check_playback_speed"))]
    pub playback_speed: Decimal
}


/// Struct representing the desynchronization tolerance for a room.
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomDesyncTolerance {
    /// The ID of the room
    #[validate(range(min = 1))]
    pub id: Id,

    /// The new desynchronization tolerance for the room
    #[validate(custom(function = "validators::check_desync_tolerance"))]
    pub desync_tolerance: Decimal
}


/// Struct representing the playback slowdown for minor desynchronization in a room.
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomMinorDesyncPlaybackSlow {
    /// The ID of the room
    #[validate(range(min = 1))]
    pub id: Id,

    /// The playback slowdown value for minor desynchronization in the room
    #[validate(custom(function = "validators::check_minor_desync_playback_slow"))]
    pub minor_desync_playback_slow: Decimal
}


/// Struct representing the minimum major desynchronization tolerance for a room.
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomMajorDesyncMin {
    /// The ID of the room
    #[validate(range(min = 1))]
    pub id: Id,

    /// The minimum value for major desynchronization tolerance in the room
    #[validate(custom(function = "validators::check_major_desync_min"))]
    pub major_desync_min: Decimal
}


/// Struct representing the order of rooms.
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomOrder {
    /// A collection of room IDs representing the order of rooms
    #[validate(custom(function = "validators::check_room_order"))]
    pub room_order: Vec<Id>
}


/// Struct representing a request to join a room.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct JoinRoomReq {
    /// The ID of the room to join
    #[validate(range(min = 1))]
    pub rid: Id,

    /// The ping value of the user joining the room
    #[validate(custom(function = "validators::check_ping"))]
    pub ping: f64
}


/// Struct representing the ping value in a room.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RoomPing {
    /// The ping value of the user in the room
    #[validate(custom(function = "validators::check_ping"))]
    pub ping: f64
}


/// Struct representing a change in the ping value for a room user.
#[derive(Debug, Clone, Serialize)]
pub struct RoomUserPingChange {
    /// The user ID
    pub uid: Id,

    /// The new ping value of the user
    pub ping: f64
}


/// Struct representing a change in the room a user is in.
#[derive(Debug, Clone, Serialize)]
pub struct UserRoomChange {
    /// The old room ID of the user
    pub old_rid: Id,

    /// The new room ID of the user
    pub new_rid: Id,

    /// The user ID of the user whose room is being changed
    pub uid: Id
}


/// Struct representing a user joining a room.
#[derive(Debug, Clone, Serialize)]
pub struct UserRoomJoin {
    /// The room ID the user is joining
    pub rid: Id,

    /// The user ID of the user joining the room.
    pub uid: Id
}


/// Struct representing a user disconnecting from a room.
#[derive(Debug, Clone, Serialize)]
pub struct UserRoomDisconnect {
    /// The room ID the user is disconnecting from.
    pub rid: Id,

    /// The user ID of the user disconnecting from the room.
    pub uid: Id
}


/// Represents the information about a room that a user has joined.
#[derive(Debug, Clone, Serialize)]
pub struct JoinedRoomInfo<'a> {
    /// A map of user IDs (`Id`) to their respective ping times in the room
    pub room_pings: HashMap<Id, f64>,

    /// The settings associated with the room
    pub room_settings: RoomSettings,

    /// A map of playlist entry IDs (`PlaylistEntryId`) to the actual playlist entries
    pub playlist: HashMap<PlaylistEntryId, &'a PlaylistEntry>,

    /// A set of ordered playlist entry IDs (`PlaylistEntryId`)
    pub playlist_order: IndexSet<PlaylistEntryId>,

    /// A map of user IDs (`Id`) to their ready status (`UserReadyStatus`)
    pub ready_status: HashMap<Id, UserReadyStatus>,

    /// The ID of the currently active video in the room, if there is one
    pub active_video_id: Option<PlaylistEntryId>,

    /// A map of user IDs (`Id`) to their audio/subtitle information (`UserPlayInfo`).
    pub users_audio_sub: HashMap<Id, UserPlayInfo>
}

/// Represents a request to get information about files from a file server.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct GetFilesInfo {
    /// The file server's address
    pub file_srv: String,

    /// The path to the file being requested
    #[validate(custom(function = "validators::check_path"))]
    pub path: String,

    /// The type of the file being requested
    pub file_kind: FileKind
}

/// Enum representing the types of files supported.
#[derive(Debug, Clone, PartialEq, Deserialize_repr)]
#[repr(u8)]
pub enum FileKind {
    /// Represents a video file
    Video = 0
}


/// Represents a request to add video files to the playlist.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct AddVideoFiles {
    /// A collection of full file paths to the video files that will be added to the playlist
    #[validate(custom(function = "validators::check_source_files_paths"))]
    pub full_paths: Vec<String>
}


/// Represents a request to add URLs to the playlist.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct AddUrls {
    /// A collection of URLs to be added to the playlist
    #[validate(custom(function = "validators::check_urls"))]
    pub urls: Vec<String>
}


/// Structure encapsulating playlist entry ID.
#[derive(Debug, Clone, Validate, Deserialize)]
pub struct PlaylistEntryIdStruct {
    /// The ID of the playlist entry
    #[validate(custom(function = "validators::check_playlist_entry_id"))]
    pub playlist_entry_id: PlaylistEntryId
}


/// Represents the order of playlist entries.
#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct PlaylistOrder {
    /// A collection representing the ordered list of playlist entry IDs (`PlaylistEntryId`).
    #[validate(custom(function = "validators::check_playlist_order"))]
    pub playlist_order: Vec<PlaylistEntryId>
}


/// Represents a request to change the ready state of a user.
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct UserReadyStateChangeReq {
    /// The new ready state of the user
    #[validate(custom(function = "validators::check_ready_not_ready"))]
    pub ready_state: UserReadyStatus
}


/// Represents a message indicating that a user has changed their ready state,
/// which should be propagated to other clients.
#[derive(Debug, Clone, Serialize)]
pub struct UserReadyStateChangeClient {
    /// The ID of the user whose ready state is being updated
    pub uid: Id,

    /// The new ready state of the user
    pub ready_state: UserReadyStatus
}


/// Represents the response to adding entry files.
#[derive(Debug, Clone, Serialize)]
pub struct AddEntryFilesResp {
    /// A map of `PlaylistEntryId` to `PlaylistEntry` representing the entries that were added.
    pub entries: IndexMap<PlaylistEntryId, PlaylistEntry>,

    /// The ID of the user who initiated the action of adding files
    pub uid: Id,
}


/// Represents a request to delete a playlist entry.
#[derive(Debug, Clone, Serialize)]
pub struct DeletePlaylistEntry {
    /// The ID of the user who wishes to delete the playlist entry
    pub uid: Id,

    /// The ID of the playlist entry that should be deleted
    pub entry_id: PlaylistEntryId
}


/// Represents a request to change the order of playlist entries.
#[derive(Debug, Clone, Serialize)]
pub struct ChangePlaylistOrder {
    /// The ID of the user who is requesting to change the playlist order.
    pub uid: Id,

    /// A vector of `PlaylistEntryId` values representing the new order of the playlist entries.
    pub order: Vec<PlaylistEntryId>
}


/// Represents the user's mpv configuration that will be forwarded to other clients.
#[derive(Debug, Copy, Clone, Deserialize)]
pub struct UploadMpvState {
    /// Audio track ID representing the audio stream to be used during playback
    pub aid: Option<u64>,

    /// Subtitle track ID representing the subtitle stream to be used during playback
    pub sid: Option<u64>,

    /// The audio delay in seconds (`f64`)
    pub audio_delay: f64,

    /// The subtitle delay in seconds (`f64`)
    pub sub_delay: f64
}


/// Represents the state of mpv.
#[derive(Debug, Copy, Clone, Serialize)]
pub struct MpvState {
    /// The current playing state of mpv
    pub playing_state: PlayingState,

    /// The current playback speed of mpv
    pub playback_speed: Decimal,

    /// The timestamp of the current position in the media playback
    pub timestamp: f64,
}

/// Represents a structure for acknowledging a Socket.IO event with a status and optional payload.
#[serde_with::serde_as]
#[serde_with::skip_serializing_none]
#[derive(Debug, Clone, serde::Serialize)]
pub struct SocketIoAck<T: Serialize> {
    /// Status of the acknowledgment (`Ok` or `Err`)
    status: SocketIoAckType,

    /// Optional payload data associated with the acknowledgment
    payload: Option<T>
}

impl<T: Serialize + Clone> SocketIoAck<T> {
    /// Creates an acknowledgment response indicating success with an optional payload.
    ///
    /// This method generates a successful acknowledgment response with the provided payload. If no payload
    /// is given, `None` is passed. The response status will be set to `SocketIoAckType::Ok`.
    ///
    /// # Arguments
    /// - `payload`: An optional payload of type `T` to include with the acknowledgment. If no payload is provided,
    ///   it will be set to `None`.
    ///
    /// # Returns
    /// A `SocketIoAck` instance with `status` set to `Ok` and the provided `payload`.
    pub fn ok(payload: Option<T>) -> Self {
        Self { status: SocketIoAckType::Ok, payload: payload.map(|x| x.clone()) }
    }

    /// Creates an acknowledgment response indicating an error with no payload.
    ///
    /// This method generates an error acknowledgment response without any associated payload. The response status
    /// will be set to `SocketIoAckType::Err`.
    ///
    /// # Returns
    /// A `SocketIoAck` instance with `status` set to `Err` and `payload` set to `None`.
    pub fn err() -> Self {
        Self { status: SocketIoAckType::Err, payload: None }
    }
}


/// Enumerates the types of acknowledgment statuses for Socket.IO.
#[derive(Debug, Clone, Serialize_repr)]
#[repr(u8)]
pub enum SocketIoAckType {
    /// Indicates a successful acknowledgment
    Ok = 0,

    /// Indicates an error in the acknowledgment
    Err = 1
}