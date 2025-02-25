import Decimal from "decimal.js";
import {UserRoomPingsSrv} from "@models/roomUser.ts";
import {
    PlaylistEntryId,
    PlaylistEntryUrl,
    PlaylistEntryVideoSrv
} from "@models/playlist.ts";
import {UserId} from "@models/user.ts";
import {UserAudioSubtitles} from "@models/mpv.ts";

export type RoomId = number

export interface RoomValue {
    name: string,
}

export interface RoomSrv extends RoomValue {
    id: RoomId
}

export type RoomMap = Map<RoomId, RoomValue>

export interface RoomNameChange {
    rid: number,
    room_name: string
}

export interface RoomPlaybackSpeed {
    id: RoomId,
    playback_speed: string
}

export interface RoomDesyncTolerance {
    id: RoomId,
    desync_tolerance: string
}

export interface RoomsWOrder {
    rooms: Array<RoomSrv>
    room_order: Array<RoomId>
}

export interface RoomSettingsSrv {
    playback_speed: string,
    minor_desync_playback_slow: string,
}

export interface RoomSettingsClient {
    playback_speed: Decimal,
    minor_desync_playback_slow: Decimal,
}

export interface JoinedRoomInfoSrv {
    room_pings: UserRoomPingsSrv,
    room_settings: RoomSettingsSrv,
    playlist: Record<string, PlaylistEntryVideoSrv | PlaylistEntryUrl>,
    playlist_order: Array<PlaylistEntryId>
    ready_status: Record<UserId, string>
    active_video_id: number | null
    users_audio_sub: Record<string, UserAudioSubtitles>
}