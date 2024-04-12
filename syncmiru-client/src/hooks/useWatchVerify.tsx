import useSWR from "swr";
import {invoke} from "@tauri-apps/api/core";

export const useWatchVerify = (email: string) =>
    useSWR('get_email_verified', cmd => invoke<boolean>(cmd, {email: email}),
        {refreshInterval: 5000})