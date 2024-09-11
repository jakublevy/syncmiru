import {UserId} from "@models/user.ts";

export type PlaylistEntryId = number

export interface PlaylistEntryVideoSrv {
    source: string,
    path: string,
    type: PlaylistEntryType
}

export interface PlaylistEntryUrlSrv {
    url: string,
    type: PlaylistEntryType,
}

export enum PlaylistEntryType {
    Video = "video",
    Url = "url"
}

export abstract class PlaylistEntry {
    public abstract pretty(): string
}

export class PlaylistEntryVideo implements PlaylistEntry {
    public type: PlaylistEntryType = PlaylistEntryType.Video;
    constructor(public source: string, public path: string) {}

    public pretty() {
        return `${this.source}:${this.path}`
    }
}

export class PlaylistEntryUrl implements PlaylistEntry {
    public type: PlaylistEntryType = PlaylistEntryType.Url;
    constructor(public url: string) {}

    public pretty() {
        return this.url
    }
}

export interface AddVideoFilesRespSrv {
    uid: UserId
    entries: Record<string, PlaylistEntryVideoSrv>
}

export interface AddUrlFilesRespSrv {
    uid: UserId
    entries: Record<string, PlaylistEntryUrlSrv>
}

export interface DeletePlaylistEntry {
    uid: UserId,
    entry_id: PlaylistEntryId
}

export interface ChangePlaylistOrder {
    uid: UserId,
    order: Array<PlaylistEntryId>
}