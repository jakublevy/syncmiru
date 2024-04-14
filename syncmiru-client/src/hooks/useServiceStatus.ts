import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";
import {ServiceStatus} from "@models/serviceStatus.ts";
import useSWRImmutable from "swr/immutable";

export const useServiceStatusWatch = () =>
    useSWR('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {
            refreshInterval: 30000
    })

export const useServiceStatus = () =>
    useSWRImmutable('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {
        suspense: false,
    })
