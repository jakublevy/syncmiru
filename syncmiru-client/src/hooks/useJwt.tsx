import useSWRImmutable from "swr/immutable";
import {invoke} from "@tauri-apps/api/core";
import {usePromise} from "@mittwald/react-use-promise";

export const useJwt = (): string => {
    return usePromise(jwtPromise, [], {tags: ["useJwt"]})
}

const jwtPromise = (): Promise<string> => {
    return invoke('jwt', {})
}
