// @ts-ignore
import {cache} from "react";
import {invoke} from "@tauri-apps/api/core";

export const firstRunSeenPromise = cache(async (): Promise<boolean> => {
    return invoke('get_first_run_seen', {})
})

export function useChangeFirstRunSeen(): () => Promise<void> {
    return (): Promise<void> => {
        return invoke('set_first_run_seen', {})
    }
}
