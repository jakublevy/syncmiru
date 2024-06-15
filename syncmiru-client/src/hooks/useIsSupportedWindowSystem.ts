import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useIsSupportedWindowSystem = (): boolean => {
    return usePromise(isSupportedWindowSystem, [], {tags: ["useIsSupportedWindowSystem"]})
}

const isSupportedWindowSystem = (): Promise<boolean> => {
    return invoke('get_is_supported_window_system', {})
}
