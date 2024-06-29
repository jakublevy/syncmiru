use std::collections::HashMap;
use indexmap::IndexSet;
use rust_decimal::Decimal;
use serde::{Serialize, Deserialize};
use serde_repr::{Deserialize_repr, Serialize_repr};
use validator::Validate;
use crate::models::playlist::PlaylistEntry;
use crate::validators;
use crate::models::query::{Id, RoomSettings};
use crate::srvstate::PlaylistEntryId;

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct LoginTkns {
    #[validate(length(equal = 64))]
    pub hwid_hash: String,

    #[validate(length(min = 1))]
    pub jwt: String
}

#[derive(Debug, Copy, Clone, Deserialize, Validate)]
pub struct IdStruct {
    #[validate(range(min = 1))]
    pub id: Id
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Displayname {
    #[validate(custom(function = "validators::check_displayname_format"))]
    pub displayname: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct DisplaynameChange {
    pub uid: Id,
    pub displayname: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct EmailChangeTkn {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,
    pub tkn_type: EmailChangeTknType
}

#[derive(Debug, Copy, Clone, PartialEq, Deserialize_repr)]
#[repr(u8)]
pub enum EmailChangeTknType {
    From = 0,
    To = 1
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct ChangeEmail {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn_from: String,

    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn_to: String,

    #[validate(email, length(max = 320))]
    pub email_new: String,

    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct AvatarBin {
    #[validate(custom(function = "validators::check_avatar"))]
    pub data: Vec<u8>
}

#[derive(Debug, Clone, Serialize)]
pub struct AvatarChange {
    pub uid: Id,
    pub avatar: Vec<u8>
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Password {
    #[validate(custom(function = "validators::check_password_format"))]
    pub password: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct ChangePassword {
    #[validate(custom(function = "validators::check_password_format"))]
    pub old_password: String,

    #[validate(custom(function = "validators::check_password_format"))]
    pub new_password: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct Language {
    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct TknWithLang {
    #[validate(custom(function = "validators::check_tkn"))]
    pub tkn: String,

    #[validate(custom(function = "validators::check_lang"))]
    pub lang: String
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RegTknCreate {
    #[validate(custom(function = "validators::check_reg_tkn_name"))]
    pub reg_tkn_name: String,

    #[validate(custom(function = "validators::check_reg_tkn_max_regs"))]
    pub max_regs: Option<i32>
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RegTknName {
    #[validate(custom(function = "validators::check_reg_tkn_name"))]
    pub reg_tkn_name: String,
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct PlaybackSpeed {
    #[validate(custom(function = "validators::check_playback_speed"))]
    pub playback_speed: Decimal
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct DesyncTolerance {
    #[validate(custom(function = "validators::check_desync_tolerance"))]
    pub desync_tolerance: Decimal
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct MajorDesyncMin {
    #[validate(custom(function = "validators::check_major_desync_min"))]
    pub major_desync_min: Decimal
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct MinorDesyncPlaybackSlow {
    #[validate(custom(function = "validators::check_minor_desync_playback_slow"))]
    pub minor_desync_playback_slow: Decimal
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RoomName {
    #[validate(custom(function = "validators::check_room_name"))]
    pub room_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomNameChange {
    #[validate(range(min = 1))]
    pub rid: Id,

    #[validate(custom(function = "validators::check_room_name"))]
    pub room_name: String
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomPlaybackSpeed {
    #[validate(range(min = 1))]
    pub id: Id,

    #[validate(custom(function = "validators::check_playback_speed"))]
    pub playback_speed: Decimal
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomDesyncTolerance {
    #[validate(range(min = 1))]
    pub id: Id,

    #[validate(custom(function = "validators::check_desync_tolerance"))]
    pub desync_tolerance: Decimal
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomMinorDesyncPlaybackSlow {
    #[validate(range(min = 1))]
    pub id: Id,

    #[validate(custom(function = "validators::check_minor_desync_playback_slow"))]
    pub minor_desync_playback_slow: Decimal
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomMajorDesyncMin {
    #[validate(range(min = 1))]
    pub id: Id,

    #[validate(custom(function = "validators::check_major_desync_min"))]
    pub major_desync_min: Decimal
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct RoomOrder {
    #[validate(custom(function = "validators::check_room_order"))]
    pub room_order: Vec<Id>
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct JoinRoomReq {
    #[validate(range(min = 1))]
    pub rid: Id,

    #[validate(custom(function = "validators::check_ping"))]
    pub ping: f64
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct RoomPing {
    #[validate(custom(function = "validators::check_ping"))]
    pub ping: f64
}

#[derive(Debug, Clone, Serialize)]
pub struct RoomUserPingChange {
    pub uid: Id,
    pub ping: f64
}

#[derive(Debug, Clone, Serialize)]
pub struct UserRoomChange {
    pub old_rid: Id,
    pub new_rid: Id,
    pub uid: Id
}

#[derive(Debug, Clone, Serialize)]
pub struct UserRoomJoin {
    pub rid: Id,
    pub uid: Id
}

#[derive(Debug, Clone, Serialize)]
pub struct UserRoomDisconnect {
    pub rid: Id,
    pub uid: Id
}

#[derive(Debug, Clone, Serialize)]
pub struct JoinedRoomInfo<'a> {
    pub room_pings: HashMap<Id, f64>,
    pub room_settings: RoomSettings,
    pub playlist: HashMap<PlaylistEntryId, &'a PlaylistEntry>,
    pub playlist_order: IndexSet<PlaylistEntryId>,
    pub subs_order: HashMap<PlaylistEntryId, IndexSet<PlaylistEntryId>>
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct GetFilesInfo {
    pub file_srv: String,

    #[validate(custom(function = "validators::check_path"))]
    pub path: String,

    pub file_kind: FileKind
}

#[derive(Debug, Clone, PartialEq, Deserialize_repr)]
#[repr(u8)]
pub enum FileKind {
    Video = 0,
    Subtitles = 1
}

#[derive(Debug, Clone, Deserialize, Validate)]
pub struct AddVideoFiles {
    #[validate(custom(function = "validators::check_source_files_paths"))]
    pub full_paths: Vec<String>
}


#[derive(Debug, Clone, Deserialize, Validate)]
pub struct AddSubtitlesFiles {
    pub video_id: PlaylistEntryId,
    pub subs_full_paths: Vec<String>
}

#[derive(Debug, Clone, Validate, Deserialize)]
pub struct PlayingId {
    #[validate(custom(function = "validators::check_playlist_entry_id"))]
    pub playlist_entry_id: PlaylistEntryId
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate)]
pub struct PlaylistOrder {
    #[validate(custom(function = "validators::check_playlist_order"))]
    pub playlist_order: Vec<PlaylistEntryId>
}

#[serde_with::serde_as]
#[serde_with::skip_serializing_none]
#[derive(Debug, Clone, serde::Serialize)]
pub struct SocketIoAck<T: Serialize> {
    status: SocketIoAckType,
    payload: Option<T>
}

impl<T: Serialize + Clone> SocketIoAck<T> {
    pub fn ok(payload: Option<T>) -> Self {
        Self { status: SocketIoAckType::Ok, payload: payload.map(|x| x.clone()) }
    }
    pub fn err() -> Self {
        Self { status: SocketIoAckType::Err, payload: None }
    }
}

#[derive(Debug, Clone, Serialize_repr)]
#[repr(u8)]
pub enum SocketIoAckType {
    Ok = 0,
    Err = 1
}