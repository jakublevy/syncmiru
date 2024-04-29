import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useHwidHash = (): string => {
    return usePromise(hwidHashPromise, [], {tags: ["useHwidHash"]})
}

const hwidHashPromise = (): Promise<string> => {
    return invoke('get_hwid_hash', {})
}
