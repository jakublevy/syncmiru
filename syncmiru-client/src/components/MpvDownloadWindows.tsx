import React, {ReactElement, useEffect, useState} from "react";
import {event} from '@tauri-apps/api'
import {useEventListen} from "../hooks/useEventListen.ts";
import {useMpvStartDownloading} from "../hooks/useMpvStartDownloading.ts";
import {EventCallback, Event, listen} from "@tauri-apps/api/event";
import DownloadProgressBar from "./DownloadProgressBar.tsx";
import {Simulate} from "react-dom/test-utils";
import load = Simulate.load;
import Loading from "./Loading.tsx";
import {useNavigate} from "react-router-dom";

export default function MpvDownloadWindows(): ReactElement {
    const navigate = useNavigate()
    const [loading, setLoading] = useState<boolean>(true)

    const [mpvDownloadProgress, setMpvDownloadProgress]
        = useState<DownloadProgress>({received: 0, speed: 0})

    const [mpvDownloadInfo, setMpvDownloadInfo]
        = useState<DownloadStart>({url: '', size: 1})

    // const [mpvDownloadInfo, setMpvDownloadInfo] =
    //     useState<DownloadStart>({url: 'mpv', size: 30*1024*1024})
    //
    // const mpvDownloadStartUnlistenFn =
    //     useEventListen<DownloadStart>('mpv-download-start', mpvDownloadStarted)
    //
    // const mpvDownloadProgressUnlistenFn =
    //     useEventListen<DownloadProgress>('mpv-download-progress', mpvDownloadProgress)
    //
    // const mpvDownloadFinishedUnlistenFn =
    //     useEventListen<void>('mpv-download-finished', mpvDownloadFinished)
    //

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
            navigate('/main')
        })
    }, [loading, mpvDownloadProgress, mpvDownloadInfo]);

    // useEventListen<DownloadStart>('mpv-download-start', (e: Event<DownloadStart>) => {
    //     setMpvDownloadInfo(e.payload)
    // })
    //
    // useEventListen<DownloadProgress>('mpv-download-progress', (e: Event<DownloadProgress>) => {
    //     setMpvDownloadProgress(e.payload)
    //     setLoading(false)
    // })
    //
    // useEventListen<void>('mpv-download-finished', (e: Event<void>) => {
    //     setMpvDownloadProgress({...mpvDownloadProgress, received: mpvDownloadInfo.size})
    //     let a = 4;
    // })

    // useEffect(() => {
    //     listen<DownloadProgress>('mpv-download-progress',(e: Event<DownloadProgress>) => {
    //         setMpvDownloadProgress(e.payload)
    //     })
    // }, []);

    useMpvStartDownloading()
    //
    //
    // function mpvDownloadStarted(event: Event<DownloadStart>) {
    //     console.log(`Downloading started, file size is ${event.payload.size}`)
    //
    //     setMpvDownloadInfo(event.payload)
    //
    //     mpvDownloadStartUnlistenFn()
    // }
    //
    // function mpvDownloadProgress(event: Event<DownloadProgress>) {
    //     console.log(`Downloading progress, received ${event.payload.received} since last`)
    // }
    //
    // function mpvDownloadFinished(event: Event<void>) {
    //     console.log('Downloading finished')
    //     mpvDownloadProgressUnlistenFn()
    //     mpvDownloadFinishedUnlistenFn()
    // }

    if (loading) {
        return <Loading/>
    } else {
        return (
            <div className="flex justify-center items-center h-dvh">
                <div className="flex flex-col items-center p-4 border-4 m-4 w-[40rem]">
                    <h1 className="text-center text-4xl mb-4">Probíhá stahování mpv</h1>
                    {/*<DownloadProgressBar*/}
                    {/*    title={"https://sourceforge.com/test/mpv/neco/tohle-je-dlouhy-odkaz-neco-tohle-je-dlouhy-odkaz-neco-tohle-je-dlouhy-odkaz-neco"}*/}
                    {/*    downloadedBytes={2349824039}*/}
                    {/*    totalSizeBytes={3489439348934}*/}
                    {/*    speedBytesPerSecond={3423434}*/}
                    {/*    finishedMsg="Probíhá extrahování ..."*/}
                    {/*/>*/}
                    <DownloadProgressBar
                        title={mpvDownloadInfo.url}
                        downloadedBytes={mpvDownloadProgress.received}
                        totalSizeBytes={mpvDownloadInfo.size}
                        speedBytesPerSecond={mpvDownloadProgress.speed}
                        finishedMsg="Probíhá extrahování ..."
                    />
                    <button className="btn-primary mt-4">Zkusit znovu</button>
                </div>
            </div>
        )
    }
}


// const unlistenFn = useEventListen<DownloadProgress>('test-emit', listen);
// useTestCall();

// function listen(event: Event<DownloadProgress>) {
//     console.log(`Received ${JSON.stringify(event)}`)
// }

// const alreadyDownloading = useRef(false);
// useEffect((): ReturnType<EffectCallback> => {
//     if (!alreadyDownloading.current) {
//
//     }
//     return (): void => {
//         alreadyDownloading.current = true
//         //unlistenFn()
//     }
// }, [])

// const mpvDownloadInfoRef = useRef<DownloadStart>({url: 'mpv', size: 30*1024*1024})