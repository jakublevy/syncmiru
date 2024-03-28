import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useFirstRunSeen = (): boolean => {
    return usePromise(firstRunSeenPromise, [], {tags: ["useFirstRunSeen"]})
}

const firstRunSeenPromise = async (): Promise<boolean> => {
    return invoke('get_first_run_seen', {})
}

export function useChangeFirstRunSeen(): () => Promise<void> {
    return (): Promise<void> => {
        return invoke('set_first_run_seen', {})
    }
}
