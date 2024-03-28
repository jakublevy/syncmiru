import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useTargetFamily = (): string => {
    return usePromise(targetFamilyPromise, [], {tags: ["useTargetFamily"]})
}

const targetFamilyPromise = (): Promise<string> => {
    return invoke('get_target_family', {})
}
