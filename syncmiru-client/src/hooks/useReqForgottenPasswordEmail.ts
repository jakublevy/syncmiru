import useSWR from "swr";
import {invoke} from "@tauri-apps/api/core";

export const useReqForgottenPasswordEmail = (email: string) =>
    useSWR('req_forgotten_password_email', cmd => invoke<void>(cmd, {email: email}), {
        suspense: true,
        revalidateOnFocus: false,
        revalidateOnMount:false,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
        refreshInterval: 0
    })
