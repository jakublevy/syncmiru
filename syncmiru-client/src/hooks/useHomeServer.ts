import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useHomeServer = (): string => {
    return usePromise(homeSrvPromise, [], {tags: ["useHomeServer"]})
}

const homeSrvPromise = (): Promise<string> => {
    return invoke('get_home_srv', {})
}

export function useChangeHomeServer(): (l: string) => Promise<void> {
    return (srv: string): Promise<void> => {
        return invoke('set_language', {homeSrv: srv})
    }
}
