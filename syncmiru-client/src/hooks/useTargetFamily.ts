import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";

export const useTargetFamily = () =>
    useSWR('get_target_family', cmd => invoke<string>(cmd, {}), {suspense: true})
