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
    constructor(public source: string, public path: string, public videoId: PlaylistEntryId) {}
}
