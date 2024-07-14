import {createContext, useContext} from "react";
import {MainContextModel, RoomConnectionState} from "@models/context.ts";
import {UserId, UserValueClient} from "src/models/user.ts";
import {RoomId, RoomValue} from "@models/room.ts";
import Decimal from "decimal.js";
import {PlaylistEntry, PlaylistEntryId} from "@models/playlist.ts";
import {MultiMap} from "mnemonist";

export const MainContext = createContext<MainContextModel>(
    {
        uid: 1,
        socket: undefined,
        users: new Map<UserId, UserValueClient>(),
        setUsers: (v) => {},
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
        usersClickedUid: -1,
        setUsersClickedUid: (v) => {},
        roomPingTimerRef: null,
        uidPing: new Map<UserId, number>(),
        setUidPing: (v) => {},
        joinedRoomSettings: {
                playback_speed: new Decimal(1),
                minor_desync_playback_slow: new Decimal(0.05),
        },
        setJoinedRoomSettings: (v) => {},
        mpvWinDetached: false,
        setMpvWinDetached: (v) => {},
        source2url: new Map<string,string>(),
        setSource2url: (v) => {},
        playlist: new Map<PlaylistEntryId, PlaylistEntry>(),
        setPlaylist: (v) => {},
        playlistOrder: new Array<PlaylistEntryId>(),
        setPlaylistOrder: (v) => {},
        subtitles: new MultiMap<PlaylistEntryId, PlaylistEntryId>(Set),
        setSubtitles: (v) => {},
        jwts: new Map<PlaylistEntryId, string>(),
        setJwts: (v) => {},
        mpvRunning: false,
        setMpvRunning: (v) => {}
    })

export const useMainContext = () => useContext(MainContext)