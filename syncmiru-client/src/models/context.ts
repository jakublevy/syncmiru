import {Socket} from "socket.io-client";
import {UserId, UserMap} from "src/models/user.ts";
import {RoomId, RoomMap, RoomSettingsClient} from "@models/room.ts";
import {Dispatch, MutableRefObject, SetStateAction} from "react";
import {UserRoomMap, UserRoomPingsClient} from "@models/roomUser.ts";
import {PlaylistEntry, PlaylistEntryId} from "@models/playlist.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {UserAudioSubtitles} from "@models/mpv.ts";
import Decimal from "decimal.js";

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
    source2url: Map<string, string>,
    setSource2url: Dispatch<SetStateAction<Map<string, string>>>,
    playlist: Map<PlaylistEntryId, PlaylistEntry>,
    setPlaylist: Dispatch<SetStateAction<Map<PlaylistEntryId, PlaylistEntry>>>
    playlistOrder: Array<PlaylistEntryId>
    setPlaylistOrder: Dispatch<SetStateAction<Array<PlaylistEntryId>>>
    jwts: Map<PlaylistEntryId, string>,
    setJwts: Dispatch<SetStateAction<Map<PlaylistEntryId, string>>>,
    mpvRunning: boolean,
    setMpvRunning: Dispatch<SetStateAction<boolean>>,
    modalShown: boolean,
    setModalShown: Dispatch<SetStateAction<boolean>>,
    settingsShown: boolean,
    setSettingsShown: Dispatch<SetStateAction<boolean>>
    mpvShowSmall: boolean
    setMpvShowSmall: Dispatch<SetStateAction<boolean>>
    uid2ready: Map<UserId, UserReadyState>,
    setUid2ready: Dispatch<SetStateAction<Map<UserId, UserReadyState>>>
    activeVideoId: PlaylistEntryId | null
    setActiveVideoId: Dispatch<SetStateAction<PlaylistEntryId | null>>,
    uid2audioSub: Map<UserId, UserAudioSubtitles>
    setUid2audioSub: Dispatch<SetStateAction<Map<UserId, UserAudioSubtitles>>>,
    timestampTimerRef: MutableRefObject<number> | null,
    reportedPlaybackSpeed: Decimal | null,
    setReportedPlaybackSpeed: Dispatch<SetStateAction<Decimal | null>>
}

export enum RoomConnectionState {
    Connecting,
    Disconnecting,
    Established
}