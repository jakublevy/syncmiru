import React, {ReactElement, useEffect, useState} from "react";
import {Event, listen, UnlistenFn} from "@tauri-apps/api/event";
import Loading from "@components/Loading.tsx";
import DownloadProgressBar from "@components/widgets/DownloadProgressBar.tsx";
import {useYtDlpStartDownloading} from "@hooks/useYtDlpStartDownloading.ts";
import {useTranslation} from "react-i18next";
import {useLocation} from "wouter";
import Card from "@components/widgets/Card.tsx";
import {DownloadProgress, DownloadStart} from "@models/deps.ts";

export default function YtDlpDownloading(): ReactElement {
    const {t} = useTranslation()
    const [_, navigate] = useLocation()
    const [loading, setLoading] = useState<boolean>(true)

    const [ytDlpDownloadProgress, setYtDlpDownloadProgress]
        = useState<DownloadProgress>({received: 0, speed: 0})

    const [ytDlpDownloadInfo, setYtDlpDownloadInfo]
        = useState<DownloadStart>({url: '', size: 1})

    useEffect(() => {
        let unlisten: Array<Promise<UnlistenFn>> = []
        unlisten.push(listen<DownloadStart>('yt-dlp-download-start', (e: Event<DownloadStart>) => {
            setYtDlpDownloadInfo(e.payload)
        }))
        unlisten.push(listen<DownloadProgress>('yt-dlp-download-progress', (e: Event<DownloadProgress>) => {
            setYtDlpDownloadProgress(e.payload)
            setLoading(false)
        }))
        unlisten.push(listen<void>('yt-dlp-download-finished', (e: Event<void>) => {
            setYtDlpDownloadProgress((p) => {
                return { speed: p.speed, received: ytDlpDownloadInfo.size }
            })
        }))
        unlisten.push(listen<void>('yt-dlp-extract-finished', (e: Event<void>) => {
            navigate('/login-dispatch')
        }))
        return () => {
            unlisten.forEach(x => x.then((unsub) => unsub()))
        }
    }, [loading, ytDlpDownloadProgress, ytDlpDownloadInfo]);

    useYtDlpStartDownloading()

    if (loading) {
        return <Loading/>
    } else {
        return (
            <div className="flex justify-center items-center m-3">
                <Card className="w-[40rem] p-6">
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
                </Card>
            </div>
        )
    }
}