import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";
import {ServiceStatus} from "@models/serviceStatus.ts";

export const useServiceStatusSWR = () =>
    useSWR('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {suspense: false})

export const useServiceStatus = () =>
    useSWR('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {
        suspense: false,
        revalidateOnFocus: false,
        revalidateOnMount:false,
        revalidateOnReconnect: false,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
        refreshInterval: 0
    })

// export const useServiceState = (): ServiceStatus => {
//     return usePromise(serviceStatus, [], {tags: ["useServiceStatus"]})
// }
//
// const serviceStatus = (): Promise<ServiceStatus> => {
//     return invoke('get_service_status', {})
// }