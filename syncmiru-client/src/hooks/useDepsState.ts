import {invoke} from "@tauri-apps/api/core";
import {DepsState} from "../models/config.tsx";
import {usePromise} from "@mittwald/react-use-promise";

export const useDepsState = (): DepsState => {
    return usePromise(depsStatePromise, [], {tags: ["useDepsState"]})
}

const depsStatePromise = async (): Promise<DepsState> => {
    return invoke('get_deps_state', {})
}
