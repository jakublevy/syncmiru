import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useMpvStartDownloading = () => {
    return usePromise(
        mpvStartDownloadingPromise,
        [],
        {
            useSuspense: false,
            tags: ["useMpvStartDownloading"]
        }
    )
}

const mpvStartDownloadingPromise = (): Promise<void> => {
    return invoke('mpv_start_downloading', {})
}
