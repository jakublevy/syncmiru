import {RoomId} from "@models/room.ts";
import {UserId} from "@models/user.ts";

export type UserRoomMap = Map<RoomId, Set<UserId>>
export type UserRoomSrv = Record<string, Array<UserId>>
export type UserRoomPingsSrv = Record<string, number>
export type UserRoomPingsClient = Map<UserId, number>

export interface UserRoomChange {
    old_rid: RoomId,
    new_rid: RoomId,
    uid: UserId
}

export interface UserRoomDisconnect {
    rid: RoomId
    uid: UserId
}

export interface UserRoomJoin {
    rid: RoomId
    uid: UserId
}

export interface RoomUserPingChange {
    uid: UserId,
    ping: number
}