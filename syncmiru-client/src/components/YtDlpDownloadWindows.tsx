import React, {ReactElement, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Event, listen} from "@tauri-apps/api/event";
import Loading from "./Loading.tsx";
import DownloadProgressBar from "./DownloadProgressBar.tsx";
import {useYtDlpStartDownloading} from "../hooks/useYtDlpStartDownloading.ts";

export default function YtDlpDownloadWindows(): ReactElement {
    const navigate = useNavigate()
    const [loading, setLoading] = useState<boolean>(true)

    const [ytDlpDownloadProgress, setYtDlpDownloadProgress]
        = useState<DownloadProgress>({received: 0, speed: 0})

    const [ytDlpDownloadInfo, setYtDlpDownloadInfo]
        = useState<DownloadStart>({url: '', size: 1})

    useEffect(() => {
        listen<DownloadStart>('yt-dlp-download-start', (e: Event<DownloadStart>) => {
            setYtDlpDownloadInfo(e.payload)
        })
        listen<DownloadProgress>('yt-dlp-download-progress', (e: Event<DownloadProgress>) => {
            setYtDlpDownloadProgress(e.payload)
            setLoading(false)
        })
        listen<void>('yt-dlp-download-finished', (e: Event<void>) => {
            setYtDlpDownloadProgress({...ytDlpDownloadProgress, received: ytDlpDownloadInfo.size})
        })
        listen<void>('yt-dlp-extract-finished', (e: Event<void>) => {
            navigate('/main')
        })
    }, [loading, ytDlpDownloadProgress, ytDlpDownloadInfo]);

    useYtDlpStartDownloading()

    if (loading) {
        return <Loading/>
    } else {
        return (
            <div className="flex justify-center items-center h-dvh">
                <div className="flex flex-col items-center p-4 border-4 m-4 w-[40rem]">
                    <h1 className="text-center text-4xl mb-4">Probíhá stahování yt-dlp</h1>
                    <DownloadProgressBar
                        title={ytDlpDownloadInfo.url}
                        downloadedBytes={ytDlpDownloadProgress.received}
                        totalSizeBytes={ytDlpDownloadInfo.size}
                        speedBytesPerSecond={ytDlpDownloadProgress.speed}
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