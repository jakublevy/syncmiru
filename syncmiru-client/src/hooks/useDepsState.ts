// @ts-ignore
import {cache} from "react";
import {invoke} from "@tauri-apps/api/core";
import {DepsState} from "../models/config.tsx";

export const depsStatePromise = cache(async (): Promise<DepsState> => {
    return invoke('get_deps_state', {})
})
