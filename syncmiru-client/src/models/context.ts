import {Socket} from "socket.io-client";
import {UserId, UserMap} from "src/models/user.ts";
import {RoomId, RoomMap, RoomSettingsClient} from "@models/room.ts";
import {Dispatch, MutableRefObject, SetStateAction} from "react";
import {UserRoomMap, UserRoomPingsClient} from "@models/roomUser.ts";

export interface MainContextModel {
    uid: number
    socket: Socket | undefined,
    users: UserMap,
    setUsers: Dispatch<SetStateAction<UserMap>>
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
    roomUidClicked: UserId,
    setRoomUidClicked: Dispatch<SetStateAction<UserId>>,
    usersClickedUid: UserId,
    setUsersClickedUid: Dispatch<SetStateAction<UserId>>,
    roomPingTimerRef: MutableRefObject<number> | null,
    uidPing: UserRoomPingsClient,
    setUidPing: Dispatch<SetStateAction<UserRoomPingsClient>>,
    joinedRoomSettings: RoomSettingsClient,
    setJoinedRoomSettings: Dispatch<SetStateAction<RoomSettingsClient>>,
    mpvWinDetached: boolean,
    setMpvWinDetached: Dispatch<SetStateAction<boolean>>,
}

export enum RoomConnectionState {
    Connecting,
    Disconnecting,
    Established
}