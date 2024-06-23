export type PlaylistEntryId = number

export interface PlaylistEntryValueSrv {
    source: string,
    path: string
    type: PlaylistEntryType

}

export enum PlaylistEntryType {
    Video = "video",
    Url = "url",
    Subtitles = "subtitles"
}

export class PlaylistEntry {

}

export class PlaylistEntryVideo implements PlaylistEntry {
    public type: PlaylistEntryType = PlaylistEntryType.Video;
    constructor(public source: string, public path: string) {}
}

export class PlaylistEntryUrl implements PlaylistEntry {
    public type: PlaylistEntryType = PlaylistEntryType.Url;
    constructor(public url: string) {}
}

export class PlaylistEntrySubtitles implements PlaylistEntry {
    public type: PlaylistEntryType = PlaylistEntryType.Subtitles;
    constructor(public source: string, public path: string) {}
}
