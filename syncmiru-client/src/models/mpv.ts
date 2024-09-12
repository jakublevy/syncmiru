import {UserId} from "@models/user.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import Decimal from "decimal.js";

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

export interface UserSpeedChangeSrv {
    uid: UserId,
    speed: string
}

export interface UserSpeedChangeClient {
    uid: UserId,
    speed: Decimal
}

export interface UserChangeAudioSync {
    uid: UserId,
    audio_sync: boolean
}

export interface UserChangeSubSync {
    uid: UserId,
    sub_sync: boolean
}