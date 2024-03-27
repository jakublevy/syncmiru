// @ts-ignore
import {cache} from "react";
import {invoke} from "@tauri-apps/api/core";
import {Language} from "../models/config.tsx";


export const languagePromise = cache(async (): Promise<Language> => {
    return invoke('get_language', {})
})


export function useChangeLanguage(): (l: Language) => Promise<void> {
    return (l: Language): Promise<void> => {
        return invoke('set_language', {language: l})
    }
}
