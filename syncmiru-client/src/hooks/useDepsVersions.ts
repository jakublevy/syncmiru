import useSWRImmutable from "swr/immutable";
import {invoke} from "@tauri-apps/api/core";
import {DepsVersions} from "@models/deps.ts";

export const useDepsVersions = () =>
    useSWRImmutable('get_deps_versions_fetch', cmd => invoke<DepsVersions>(cmd, {}), {
        suspense: false,
    })
