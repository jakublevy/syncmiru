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
    audio_delay: number,
    sub_delay: number
}

export interface UserAudioSubtitles {
    aid: number | null
    sid: number | null
    audio_delay: number,
    sub_delay: number,
    audio_sync: boolean,
    sub_sync: boolean
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

export interface UserChangeAudio {
    uid: UserId,
    aid: number | null
}

export interface UserChangeSub {
    uid: UserId,
    sid: number | null
}

export interface UserChangeAudioDelay {
    uid: UserId,
    audio_delay: number
}

export interface UserChangeSubDelay {
    uid: UserId,
    sub_delay: number
}

export interface UserUploadMpvState {
    uid: UserId
    aid: number | null,
    sid: number | null,
    audio_delay: number,
    sub_delay: number
}

export enum PlayingState {
    Play = 0,
    Pause = 1
}

export interface MpvState {
    playing_state: PlayingState
    playback_speed: string
    timestamp: number
}