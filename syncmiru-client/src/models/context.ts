import {Socket} from "socket.io-client";
import {UserMap} from "src/models/user.ts";
import {RoomId, RoomMap} from "@models/room.ts";
import {Dispatch, SetStateAction} from "react";
import {UserRoomMap} from "@models/roomUser.ts";

export interface MainContextModel {
    uid: number
    socket: Socket | undefined,
    users: UserMap,
    reconnecting: boolean,
    rooms: RoomMap,
    setRooms: Dispatch<SetStateAction<RoomMap>>,
    roomsLoading: boolean
    setRoomsLoading: Dispatch<SetStateAction<boolean>>,
    playlistLoading: boolean,
    setPlaylistLoading: Dispatch<SetStateAction<boolean>>,
    usersShown: boolean
    setUsersShown: Dispatch<SetStateAction<boolean>>
    audioSync: boolean,
    setAudioSync: Dispatch<SetStateAction<boolean>>,
    subSync: boolean,
    setSubSync: Dispatch<SetStateAction<boolean>>,
    ready: boolean,
    setReady: Dispatch<SetStateAction<boolean>>,
    currentRid: RoomId | null,
    setCurrentRid: Dispatch<SetStateAction<RoomId | null>>,
    roomConnection: RoomConnectionState
    setRoomConnection: Dispatch<SetStateAction<RoomConnectionState>>,
    roomUsers: UserRoomMap,
    setRoomUsers: Dispatch<SetStateAction<UserRoomMap>>,
}

export enum RoomConnectionState {
    Connecting,
    Disconnecting,
    Established
}