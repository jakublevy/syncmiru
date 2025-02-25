import React, {ReactElement, useEffect, useState} from "react";
import {useMpvStartDownloading} from "@hooks/useMpvStartDownloading.ts";
import {Event, listen, UnlistenFn} from "@tauri-apps/api/event";
import DownloadProgressBar from "@components/widgets/DownloadProgressBar.tsx";
import Loading from "@components/Loading.tsx";
import {useTranslation} from "react-i18next";
import {useLocation} from "wouter";
import Card from "@components/widgets/Card.tsx";
import {DownloadProgress, DownloadStart} from "@models/deps.ts";
import {useHistoryState} from "wouter/use-browser-location";
import {MpvDownloadHistoryState} from "@models/historyState.ts";

export default function MpvDownloading(): ReactElement {
    const {t} = useTranslation()
    const [_, navigate] = useLocation()
    const {yt_dlp}: MpvDownloadHistoryState = useHistoryState()
    const [loading, setLoading] = useState<boolean>(true)

    const [mpvDownloadProgress, setMpvDownloadProgress]
        = useState<DownloadProgress>({received: 0, speed: 0})

    const [mpvDownloadInfo, setMpvDownloadInfo]
        = useState<DownloadStart>({url: '', size: 1})

    useEffect(() => {
        let unlisten: Array<Promise<UnlistenFn>> = []
        unlisten.push(listen<DownloadStart>('mpv-download-start', (e: Event<DownloadStart>) => {
            setMpvDownloadInfo(e.payload)
        }))
        unlisten.push(listen<DownloadProgress>('mpv-download-progress', (e: Event<DownloadProgress>) => {
            setMpvDownloadProgress(e.payload)
            setLoading(false)
        }))
        unlisten.push(listen<void>('mpv-download-finished', (e: Event<void>) => {
            setMpvDownloadProgress((p) => {
                return { speed: p.speed, received: mpvDownloadInfo.size}
            })
        }))
        unlisten.push(listen<void>('mpv-extract-finished', (e: Event<void>) => {
            if(yt_dlp)
                navigate('/yt-dlp-download')
            else
                navigate('/login-dispatch')
        }))
        return () => {
            unlisten.forEach(x => x.then((unsub) => unsub()))
        }
    }, [loading, mpvDownloadProgress, mpvDownloadInfo]);

    useMpvStartDownloading()

    if (loading) {
        return <Loading/>
    } else {
        return (
            <div className="flex justify-center items-center m-3">
                <Card className="w-[40rem] p-6">
                    <h1 className="text-center text-4xl mb-4">{t('mpv-downloading-title')}</h1>
                    <DownloadProgressBar
                        title={mpvDownloadInfo.url}
                        downloadedBytes={mpvDownloadProgress.received}
                        totalSizeBytes={mpvDownloadInfo.size}
                        speedBytesPerSecond={mpvDownloadProgress.speed}
                        error={false}
                        errorMsg=""
                        finishedMsg={t('dep-extracting')}
                    />
                </Card>
            </div>
        )
    }
}