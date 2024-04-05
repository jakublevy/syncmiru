import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";
import {usePromise} from "@mittwald/react-use-promise";

export const useServiceStatus = () =>
    useSWR('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {suspense: false})

// export const useServiceState = (): ServiceStatus => {
//     return usePromise(serviceStatus, [], {tags: ["useServiceStatus"]})
// }
//
// const serviceStatus = (): Promise<ServiceStatus> => {
//     return invoke('get_service_status', {})
// }