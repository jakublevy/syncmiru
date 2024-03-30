import {ReactElement} from "react";
import {Simulate} from "react-dom/test-utils";

export default function DownloadProgressBar(
    {title, downloadedBytes, totalSizeBytes, speedBytesPerSecond, error, finishedMsg} :
        {title: string, downloadedBytes: number, totalSizeBytes: number, speedBytesPerSecond: number, error?: string, finishedMsg?: string }
): ReactElement {

    const percent = Math.round(downloadedBytes / totalSizeBytes * 100)

    const finished = () => downloadedBytes == totalSizeBytes

    function bytesPretty(b: number): string {
        const kb = 1024
        const mb = kb * 1024
        if(b < kb)
            return `${b} B`
        if(b < mb) {
            const r = Math.round(b / 1024)
            return `${r} kB`
        }
        let r = Math.round(b / 1024 / 1024 * 10) / 10
        return `${r} MB`
    }

    function remTime() {
        const upcoming = totalSizeBytes - downloadedBytes
        const s = upcoming / speedBytesPerSecond
        if(s < 60)
            return `${Math.round(s)} s`
        if(s < 3600) {
            const m = Math.floor(s / 60)
            const rem = Math.round(s % 60)
            return `${m} min ${rem} s`
        }
        else {
            const h = Math.floor(s / 3600)
            const rem = Math.floor(s % 60)
            return `${h} h ${rem} min`
        }
    }

    return (
        <>
            {/*<div>ALL: {totalSizeBytes}</div>*/}
            {/*<div>RECV: {downloadedBytes}</div>*/}
            <div className="flex justify-between items-end mb-1 w-[100%]">
                <span className="text-sm font-medium">{title}</span>
                {error == null
                    ? <span className="text-base font-medium text-primary">{percent}%</span>
                    : <span className="text-base font-medium text-danger">{percent}%</span>
                }
            </div>
            <div className="bg-gray-200 w-full rounded-full h-2.5 dark:bg-gray-700">
                {error == null
                    ? <div className="bg-primary h-2.5 rounded-full" style={{width: percent + "%"}}></div>
                    : <div className="bg-danger h-2.5 rounded-full" style={{width: percent + "%"}}></div>
                }
            </div>
            {error == null
                ? <div className="flex self-start mt-1 text-sm">
                    {finished() && finishedMsg != null
                        ? finishedMsg
                        : `${remTime()} – ${bytesPretty(downloadedBytes)} z ${bytesPretty(totalSizeBytes)} (${bytesPretty(speedBytesPerSecond)}/s)`
                    }
                </div>
                : <div className={`flex self-start mt-1 text-sm text-danger`}>{error}</div>
            }
        </>
    )
}