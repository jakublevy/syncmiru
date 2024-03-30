import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useYtDlpStartDownloading = () => {
    return usePromise(
        ytDlpStartDownloadingPromise,
        [],
        {
            useSuspense: false,
            tags: ["useYtDlpStartDownloading"]
        }
    )
}

const ytDlpStartDownloadingPromise = (): Promise<void> => {
    return invoke('yt_dlp_start_downloading', {})
}
