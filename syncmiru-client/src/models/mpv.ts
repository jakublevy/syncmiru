import {UserId} from "@models/user.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";

export interface UserLoadedInfo {
    aid: number | null
    sid: number | null
    audio_sync: boolean
    sub_sync: boolean
}

export interface UserPlayInfo {
    uid: UserId,
    status: UserReadyState,
    aid: number | null,
    sid: number | null,
    audio_sync: boolean,
    sub_sync: boolean
}

export interface UserAudioSubtitles {
    aid: number | null
    sid: number | null
    audioSync: boolean,
    subSync: boolean
}

export interface UserPause {
    uid: UserId
    timestamp: number
}

export interface UserSeek {
    uid: UserId
    timestamp: number
}

export interface UserSpeedChange {
    uid: UserId,
    speed: string
}