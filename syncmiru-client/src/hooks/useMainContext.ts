import {createContext, useContext} from "react";
import {MainContextModel, RoomConnectionState} from "@models/context.ts";
import {UserId, UserValueClient} from "src/models/user.ts";
import {RoomId, RoomValue} from "@models/room.ts";

export const MainContext = createContext<MainContextModel>(
    {
        uid: 1,
        socket: undefined,
        users: new Map<UserId, UserValueClient>(),
        reconnecting: false,
        playlistLoading: false,
        rooms: new Map<RoomId, RoomValue>(),
        setRooms: (v) => {},
        roomsLoading: false,
        setRoomsLoading: (v) => {},
        setPlaylistLoading: (v) => {},
        usersShown: true,
        setUsersShown: (v) => {},
        audioSync: true,
        setAudioSync: (v) => {},
        subSync: true,
        setSubSync: (v) => {},
        ready: false,
        setReady: (v) => {},
        currentRid: null,
        setCurrentRid: (v) => {},
        roomConnection: RoomConnectionState.Established,
        setRoomConnection: (v) => {},
        roomUsers: new Map<RoomId, Set<UserId>>(),
        setRoomUsers: (v) => {},
        roomUidClicked: -1,
        setRoomUidClicked: (v) => {},
    })

export const useMainContext = () => useContext(MainContext)