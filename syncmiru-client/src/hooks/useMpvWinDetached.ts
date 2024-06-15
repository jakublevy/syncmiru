import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useMpvWinDetached = (): boolean => {
    return usePromise(mpvWinDetached, [], {tags: ["useMpvWinDetached"]})
}

const mpvWinDetached = (): Promise<boolean> => {
    return invoke('get_mpv_win_detached', {})
}

export function useChangeMpvWinDetached(): (mpvWinDetached: boolean) => Promise<void> {
    return (mpvWinDetached: boolean): Promise<void> => {
        return invoke('set_mpv_win_detached', {mpvWinDetached: mpvWinDetached})
    }
}
