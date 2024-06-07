import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useAudioSync = (): boolean => {
    return usePromise(audioSync, [], {tags: ["useAudioSync"]})
}

const audioSync = (): Promise<boolean> => {
    return invoke('get_audio_sync', {})
}

export function useChangeAudioSync(): (audioSync: boolean) => Promise<void> {
    return (audioSync: boolean): Promise<void> => {
        return invoke('set_audio_sync', {audioSync: audioSync})
    }
}
