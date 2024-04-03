import {invoke} from "@tauri-apps/api/core";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

export const useHomeServer = () =>
    useSWR('get_home_srv', cmd => invoke<string>(cmd, {}), {suspense: true})

async function updateHomeServer(cmd: string, { arg }: {arg: string}): Promise<void> {
    await invoke<void>(cmd, {homeSrv: arg})
}

export const useChangeHomeServer = () => {
    return useSWRMutation('set_home_srv', updateHomeServer)
}
