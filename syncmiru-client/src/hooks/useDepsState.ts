import {invoke} from "@tauri-apps/api/core";
import {DepsState} from "@models/config.tsx";
import useSWR from "swr";

export const useDepsState = () =>
    useSWR('get_deps_state', cmd => invoke<DepsState>(cmd, {}), {suspense: true})
