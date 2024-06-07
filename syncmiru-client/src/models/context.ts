import {Socket} from "socket.io-client";
import {UserMap} from "src/models/user.ts";
import {RoomMap} from "@models/room.ts";
import {Dispatch, SetStateAction} from "react";

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
}