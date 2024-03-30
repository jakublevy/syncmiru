import React, {ReactElement, useEffect, useState} from "react";
import {useMpvStartDownloading} from "../hooks/useMpvStartDownloading.ts";
import {Event, listen} from "@tauri-apps/api/event";
import DownloadProgressBar from "./DownloadProgressBar.tsx";
import Loading from "./Loading.tsx";
import {useNavigate} from "react-router-dom";

export default function MpvDownloadWindows(): ReactElement {
    const navigate = useNavigate()
    const [loading, setLoading] = useState<boolean>(true)

    const [mpvDownloadProgress, setMpvDownloadProgress]
        = useState<DownloadProgress>({received: 0, speed: 0})

    const [mpvDownloadInfo, setMpvDownloadInfo]
        = useState<DownloadStart>({url: '', size: 1})

    useEffect(() => {
        listen<DownloadStart>('mpv-download-start', (e: Event<DownloadStart>) => {
            setMpvDownloadInfo(e.payload)
        })
        listen<DownloadProgress>('mpv-download-progress', (e: Event<DownloadProgress>) => {
            setMpvDownloadProgress(e.payload)
            setLoading(false)
        })
        listen<void>('mpv-download-finished', (e: Event<void>) => {
            setMpvDownloadProgress({...mpvDownloadProgress, received: mpvDownloadInfo.size})
        })
        listen<void>('mpv-extract-finished', (e: Event<void>) => {
            navigate('/yt-dlp-download')
        })
    }, [loading, mpvDownloadProgress, mpvDownloadInfo]);

    useMpvStartDownloading()

    if (loading) {
        return <Loading/>
    } else {
        return (
            <div className="flex justify-center items-center h-dvh">
                <div className="flex flex-col items-center p-4 border-4 m-4 w-[40rem]">
                    <h1 className="text-center text-4xl mb-4">Probíhá stahování mpv</h1>
                    <DownloadProgressBar
                        title={mpvDownloadInfo.url}
                        downloadedBytes={mpvDownloadProgress.received}
                        totalSizeBytes={mpvDownloadInfo.size}
                        speedBytesPerSecond={mpvDownloadProgress.speed}
                        error={false}
                        errorMsg="Chyba spojení"
                        finishedMsg="Probíhá extrahování ..."
                    />
                    <button className="btn-primary mt-4">Zkusit znovu</button>
                </div>
            </div>
        )
    }
}