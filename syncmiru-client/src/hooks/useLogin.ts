import useSWRImmutable from "swr/immutable";
import {invoke} from "@tauri-apps/api/core";
import {ServiceStatus} from "@models/serviceStatus.ts";

export const useLogin = () =>
    useSWRImmutable('login', cmd => invoke<void>(cmd, {}), {
        suspense: false,
    })
