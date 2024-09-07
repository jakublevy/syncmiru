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
