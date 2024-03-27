
import {invoke} from "@tauri-apps/api/core";
import {useEffect, useState} from "react";
import {Language} from "../models/config.tsx";

export default function useLanguage(): [Language | undefined, (l: Language) => Promise<void>] {
    const [lang, setLang] = useState<Language>()
    const fetchLanguage = async (): Promise<Language> => {
        return await invoke('get_language', {})
    }
    const invokeSetLanguage = async (l: Language): Promise<void> => {
        //return Promise.reject("ahoj")
        return invoke('set_language', {language: l}).then(() => setLang(l))
    }

    useEffect(() => {
        fetchLanguage().then(b => setLang(b))
    }, []);

    return [lang, invokeSetLanguage]
}
