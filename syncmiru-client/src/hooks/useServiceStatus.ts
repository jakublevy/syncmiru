import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";
import {ServiceStatus} from "@models/serviceStatus.ts";

export const useServiceStatusWatch = () =>
    useSWR('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {
            refreshInterval: 30000
    })

export const useServiceStatusSuspense = () =>
    useSWR('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {
            suspense: true,
            revalidateOnFocus: false,
            revalidateOnMount:false,
            revalidateOnReconnect: false,
            refreshWhenOffline: false,
            refreshWhenHidden: false,
            refreshInterval: 0,
    })
