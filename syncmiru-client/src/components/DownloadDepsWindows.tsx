import {EffectCallback, ReactElement, useEffect, useRef} from "react";
import {listen} from '@tauri-apps/api/event'

export default function DownloadDepsWindows(): ReactElement {

    // listen<TODO>('mpv-download-progress', (event) => {
    //
    // })

    listen<void>('mpv-download-finished', () => {

    })
    listen<void>('mpv-extract-finish', () => {

    })

    listen<void>('yt-dlp-download-finished', () => {

    })
    listen<void>('yt-dlp-extract-finish', () => {

    })

    const alreadyDownloading = useRef(false);
    useEffect((): ReturnType<EffectCallback> => {
        if (!alreadyDownloading.current) {
            console.log("start downloading")

        }
        return (): void => {alreadyDownloading.current = true}
    }, [])

    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col items-center p-4 border-4 m-4">
                <h1 className="text-center text-4xl mb-4">Stahování závislostí</h1>

            </div>
        </div>
    )
}