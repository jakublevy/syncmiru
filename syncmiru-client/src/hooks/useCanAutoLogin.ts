import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";

export const useCanAutoLogin = () =>
    useSWR('can_auto_login', cmd => invoke<boolean>(cmd, {}), {suspense: true})
