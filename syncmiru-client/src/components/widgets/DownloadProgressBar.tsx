import {ReactElement} from "react";
import {useTranslation} from "react-i18next";
import {bytesPretty} from "src/utils/pretty.ts";

export default function DownloadProgressBar(
    {title, downloadedBytes, totalSizeBytes, speedBytesPerSecond, error, errorMsg, finishedMsg}: Props): ReactElement {

    const {t} = useTranslation()

    const percent = Math.round(downloadedBytes / totalSizeBytes * 100)

    const finished = (): boolean => downloadedBytes == totalSizeBytes

    function remTime(): string {
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
        <div className="flex justify-between items-end mb-1 w-[100%]">
            <span className="text-sm font-medium">{title}</span>
            {error
                ? <span className="text-base text-right font-medium text-danger ml-4 w-14">{percent}%</span>
                : <span className="text-base text-right font-medium text-primary ml-4 w-14">{percent}%</span>
            }
        </div>
            <div className="bg-gray-200 w-full rounded-full h-2.5 dark:bg-gray-700">
                {error
                    ? <div className="bg-danger h-2.5 rounded-full" style={{width: percent + "%"}}></div>
                    : <div className="bg-primary h-2.5 rounded-full" style={{width: percent + "%"}}></div>
                }
            </div>
            {error ? <div className="flex self-start mt-1 text-sm text-danger">{errorMsg}</div>
                : <div className="flex self-start mt-1 text-sm">
                    {finished() && finishedMsg != null
                        ? finishedMsg
                        : `${remTime()} – ${bytesPretty(downloadedBytes)} ${t('of')} ${bytesPretty(totalSizeBytes)} (${bytesPretty(speedBytesPerSecond)}/s)`
                    }
                </div>
            }
        </>
    )
}

interface Props {
    title: string,
    downloadedBytes: number,
    totalSizeBytes: number,
    speedBytesPerSecond: number,
    error: boolean,
    errorMsg: string,
    finishedMsg?: string
}