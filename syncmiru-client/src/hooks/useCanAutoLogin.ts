import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useCanAutoLogin = (): boolean => {
    return usePromise(autoLoginPromise, [], {tags: ["useCanAutoLogin"]})
}

const autoLoginPromise = (): Promise<boolean> => {
    return invoke('can_auto_login', {})
}
