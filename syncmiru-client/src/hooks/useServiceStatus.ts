import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";
import {ServiceStatus} from "@models/serviceStatus.ts";
import {useQuery} from "@tanstack/react-query";

export const useServiceStatusWatch = () =>
    useSWR('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {
            refreshInterval: 30000
    })

// export const useServiceStatusWatch = () =>
//     useQuery({
//         queryKey: ['get_service_status'], queryFn: () => invoke<ServiceStatus>('get_service_status', {}),
//         refetchOnMount: true,
//         refetchOnWindowFocus: true,
//         refetchOnReconnect: true,
//         refetchInterval: 30000,
//         staleTime: 5000,
//         behavior
//     }
//     );

export const useServiceStatus = () =>
        useQuery({
            queryKey: ['get_service_status'], queryFn: () => invoke<ServiceStatus>('get_service_status', {}),
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchInterval: 0,
            staleTime: 0,
})

// export const useServiceStatus = () =>
//     useSWR('get_service_status', cmd => invoke<ServiceStatus>(cmd, {}), {
//             suspense: false,
//             revalidateOnFocus: false,
//             revalidateOnMount:false,
//             revalidateOnReconnect: false,
//             refreshWhenOffline: false,
//             refreshWhenHidden: false,
//             refreshInterval: 0,
//     })
