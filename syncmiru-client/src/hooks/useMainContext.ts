import {createContext, useContext} from "react";
import {MainContextModel} from "@models/context.ts";
import {UserId, UserValueClient} from "src/models/user.ts";
import {boolean} from "joi";
import {RoomId, RoomValueClient} from "@models/room.ts";

export const MainContext = createContext<MainContextModel>(
    {
        uid: 1,
        socket: undefined,
        users: new Map<UserId, UserValueClient>(),
        reconnecting: false,
        playlistLoading: false,
        rooms: new Map<RoomId, RoomValueClient>(),
        roomsLoading: false,
        setRooms: (v) => {},
        setRoomsLoading: (v) => {},
        setPlaylistLoading: (v) => {}
    })

export const useMainContext = () => useContext(MainContext)