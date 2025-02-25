export interface DepsState {
    mpv: boolean,
    yt_dlp: boolean,
    mpv_ver: string,
    yt_dlp_ver: string,
    managed: boolean
}

export interface DepsVersions {
    mpv_cur: string,
    mpv_newest: string,
    yt_dlp_cur: string,
    yt_dlp_newest: string
}

export interface DownloadStart {
    url: string,
    size: number,
}

export interface DownloadProgress {
    speed: number,
    received: number,
}

