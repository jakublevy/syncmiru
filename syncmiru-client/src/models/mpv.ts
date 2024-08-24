import {UserId} from "@models/user.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";

export interface UserLoadedInfo {
    aid: number
    sid: number
    audio_sync: boolean
    sub_sync: boolean
}

export interface UserPlayInfo {
    uid: UserId,
    status: UserReadyState,
    aid: number,
    sid: number,
    audio_sync: boolean,
    sub_sync: boolean
}

export interface UserAudioSubtitles {
    aid: number
    sid: number
    audioSync: boolean,
    subSync: boolean
}