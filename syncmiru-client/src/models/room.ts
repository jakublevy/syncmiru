import Decimal from "decimal.js";

export type RoomId = number

interface RoomValueCommon {
    name: string,
}

export interface RoomValueClient extends RoomValueCommon {
    playback_speed: Decimal,
    desync_tolerance: Decimal,
    minor_desync_playback_slow: Decimal,
    major_desync_min: Decimal
}

export interface RoomValueSrv extends RoomValueCommon {
    playback_speed: string,
    desync_tolerance: string,
    minor_desync_playback_slow: string,
    major_desync_min: string
}

export interface RoomSrv extends RoomValueSrv {
    id: RoomId
}

export type RoomMap = Map<RoomId, RoomValueClient>

export interface RoomNameChange {
    rid: number,
    room_name: string
}

export interface RoomPlaybackSpeed {
    id: RoomId,
    playback_speed: string
}