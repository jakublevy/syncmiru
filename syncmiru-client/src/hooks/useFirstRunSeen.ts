import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";

export const useFirstRunSeen = () =>
    useSWR('get_first_run_seen', cmd => invoke<boolean>(cmd, {}), {suspense: true})

export const useSetFirstRunSeen = () =>
    useSWR('set_first_run_seen', cmd => invoke<void>(cmd, {}), {suspense: true})
