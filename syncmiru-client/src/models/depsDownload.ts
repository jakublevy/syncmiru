export interface DownloadStart {
    url: string,
    size: number,
}

export interface DownloadProgress {
    speed: number,
    received: number,
}