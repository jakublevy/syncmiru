import {invoke} from "@tauri-apps/api/core";
import {Language} from "../models/config.tsx";
import {usePromise} from "@mittwald/react-use-promise";

export const useLanguage = (): Language => {
    return usePromise(languagePromise, [], {tags: ["useLanguage"]})
}

const languagePromise = (): Promise<Language> => {
    return invoke('get_language', {})
}

export function useChangeLanguage(): (l: Language) => Promise<void> {
    return (l: Language): Promise<void> => {
        return invoke('set_language', {language: l})
    }
}
