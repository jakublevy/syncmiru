interface DownloadStart {
    url: string,
    size: number,
}

interface DownloadProgress {
    speed: number,
    received: number,
}