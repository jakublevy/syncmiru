import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";

export const useMpvStartDownloading = () =>
    useSWR('mpv_start_downloading', cmd => invoke<void>(cmd, {}), {suspense: false, errorRetryCount: 5})
