import {RegData} from "@models/login.ts";
import {invoke} from "@tauri-apps/api/core";

export function useSendRegistration(): (data: RegData) => Promise<void> {
    return (data: RegData): Promise<void> => {
        return invoke('send_registration', {data: JSON.stringify(data)})
    }
}
