import {invoke} from "@tauri-apps/api/core";
import {Language} from "@models/config.tsx";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

export const useLanguage = () =>
    useSWR('get_language', cmd => invoke<Language>(cmd, {}), {suspense: true})

async function updateLanguage(cmd: string, { arg }: {arg: Language}): Promise<void> {
    await invoke<void>(cmd, {language: arg})
}

export const useChangeLanguage = () => {
    return useSWRMutation('set_language', updateLanguage)
}
