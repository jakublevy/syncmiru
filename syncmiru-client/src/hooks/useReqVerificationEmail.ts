import useSWR from "swr";
import {invoke} from "@tauri-apps/api/core";

export const useReqVerificationEmail = (email: string) =>
    useSWR('req_verification_email', cmd => invoke<void>(cmd, {email: email}), {
        suspense: true,
        revalidateOnFocus: false,
        revalidateOnMount:false,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
        refreshInterval: 0
    })
