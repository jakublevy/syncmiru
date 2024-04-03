import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";

export const useYtDlpStartDownloading = () =>
    useSWR('yt_dlp_start_downloading', cmd => invoke<void>(cmd, {}), {suspense: false})
