import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useSubSync = (): boolean => {
    return usePromise(subSync, [], {tags: ["useSubSync"]})
}

const subSync = (): Promise<boolean> => {
    return invoke('get_sub_sync', {})
}

export function useChangeSubSync(): (subSync: boolean) => Promise<void> {
    return (subSync: boolean): Promise<void> => {
        return invoke('set_sub_sync', {subSync: subSync})
    }
}
