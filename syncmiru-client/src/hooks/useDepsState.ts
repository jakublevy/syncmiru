import {invoke} from "@tauri-apps/api/core";
import {DepsState} from "@models/deps.tsx";
import {usePromise} from "@mittwald/react-use-promise";

export const useDepsState = (): DepsState => {
    return usePromise(depsStatePromise, [], {tags: ["useDepsState"]})
}

const depsStatePromise = (): Promise<DepsState> => {
    return invoke('get_deps_state', {})
}
