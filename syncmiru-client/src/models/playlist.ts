export type PlaylistEntryId = number

export interface PlaylistEntryVideoSrv {
    source: string,
    path: string,
    type: PlaylistEntryType
}

export interface PlaylistEntrySubtitlesSrv {
    source: string,
    path: string,
    type: PlaylistEntryType,
    video_id: PlaylistEntryId
}

export interface PlaylistEntryUrlSrv {
    url: string,
    type: PlaylistEntryType,
}

export enum PlaylistEntryType {
    Video = "video",
    Url = "url",
    Subtitles = "subtitles"
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

export class PlaylistEntrySubtitles implements PlaylistEntry {
    public type: PlaylistEntryType = PlaylistEntryType.Subtitles;
    constructor(public source: string, public path: string, public videoId: PlaylistEntryId) {}

    public pretty() {
        return `${this.source}:${this.path}`
    }
}
