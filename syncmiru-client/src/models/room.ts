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