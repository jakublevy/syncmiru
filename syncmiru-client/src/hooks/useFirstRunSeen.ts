import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useFirstRunSeen = (): boolean => {
    return usePromise(firstRunSeenPromise, [], {tags: ["useFirstRunSeen"]})
}

const firstRunSeenPromise = (): Promise<boolean> => {
    return invoke('get_first_run_seen', {})
}

const setFirstRunSeenPromise = (): Promise<void> => {
    return invoke('set_first_run_seen', {})
}

export function useSetFirstRunSeen(): void {
    return usePromise(setFirstRunSeenPromise, [], {tags: ['useSetFirstRunSeen']})
}
