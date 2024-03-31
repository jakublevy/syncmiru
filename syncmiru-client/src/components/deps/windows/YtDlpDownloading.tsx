import React, {ReactElement, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Event, listen} from "@tauri-apps/api/event";
import Loading from "@components/Loading.tsx";
import DownloadProgressBar from "@components/widgets/DownloadProgressBar.tsx";
import {useYtDlpStartDownloading} from "@hooks/useYtDlpStartDownloading.ts";
import {useTranslation} from "react-i18next";

export default function YtDlpDownloading(): ReactElement {
    const {t} = useTranslation()
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
            navigate('/login-dispatch')
        })
    }, [loading, ytDlpDownloadProgress, ytDlpDownloadInfo]);

    useYtDlpStartDownloading()

    if (loading) {
        return <Loading/>
    } else {
        return (
            <div className="flex justify-center items-center h-dvh">
                <div className="flex flex-col items-center p-4 border-4 m-4 w-[40rem]">
                    <h1 className="text-center text-4xl mb-4">{t('yt-dlp-downloading-title')}</h1>
                    <DownloadProgressBar
                        title={ytDlpDownloadInfo.url}
                        downloadedBytes={ytDlpDownloadProgress.received}
                        totalSizeBytes={ytDlpDownloadInfo.size}
                        speedBytesPerSecond={ytDlpDownloadProgress.speed}
                        error={false}
                        errorMsg=""
                        finishedMsg={t('dep-extracting')}
                    />
                </div>
            </div>
        )
    }
}