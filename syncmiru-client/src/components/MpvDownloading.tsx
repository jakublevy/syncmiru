// import {ReactElement, useEffect, useState} from "react";
// import {useEventListen} from "../hooks/useEventListen.ts";
// import {Event} from '@tauri-apps/api/event'
//
// export default function MpvDownloading(): ReactElement {
//     const [mpvDownloadInfo, setMpvDownloadInfo] =
//         useState<DownloadStart>({url: 'mpv', size: 30*1024*1024})
//
//     const mpvDownloadStartUnlistenFn =
//         useEventListen<DownloadStart>('mpv-download-start', mpvDownloadStarted)
//
//      const mpvDownloadProgressUnlistenFn =
//          useEventListen<DownloadProgress>('mpv-download-progress', mpvDownloadProgress)
//
//     const mpvDownloadFinishedUnlistenFn =
//         useEventListen<void>('mpv-download-finished', mpvDownloadFinished)
//
//     function mpvDownloadStarted(event: Event<DownloadStart>) {
//         console.log(`Downloading started, file size is ${event.payload.size}`)
//
//         setMpvDownloadInfo(event.payload)
//
//         mpvDownloadStartUnlistenFn()
//     }
//
//     function mpvDownloadProgress(event: Event<DownloadProgress>) {
//         console.log(`Downloading progress, received ${event.payload.received} since last`)
//     }
//
//     useEffect(() => {
//          // const mpvDownloadProgressUnlistenFn =
//          //     useEventListen<DownloadProgress>('mpv-download-progress', mpvDownloadProgress)
//
//     }, []);
//
//     // function mpvDownloadProgress(event: Event<DownloadProgress>) {
//     //     console.log(`Downloading progress, received ${event.payload.received} since last`)
//     // }
//
//     function mpvDownloadFinished(event: Event<void>) {
//         console.log('Downloading finished')
//         mpvDownloadProgressUnlistenFn()
//         mpvDownloadFinishedUnlistenFn()
//     }
//
//     return (
//         <div>Downloading mpv</div>
//     )
// }