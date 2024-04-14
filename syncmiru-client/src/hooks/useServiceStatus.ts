import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";
import {ServiceStatus} from "@models/serviceStatus.ts";
import {useQuery} from "@tanstack/react-query";

export const useServiceStatusWatch = () =>
    useSWR('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {
            refreshInterval: 30000
    })

export const useServiceStatus = () =>
        useQuery({
            queryKey: ['get_service_status'], queryFn: () => invoke<ServiceStatus>('get_service_status', {}),
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchInterval: 0,
            staleTime: 0,
})
