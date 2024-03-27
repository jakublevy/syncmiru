// @ts-ignore
import {ReactElement, use, useEffect, useState} from 'react'

import Select from 'react-select';
import {LanguagesSelect, LanguageSelectModel, Language} from "../models/config.tsx";
import {languagePromise, useChangeLanguage} from '../hooks/useLanguage.ts'
import {useTranslation} from "react-i18next";


export default function LanguageSelector(): ReactElement {
    const initLang: Language = use(languagePromise())
    const [lang, setLang] = useState<Language>(initLang)
    const changeLang = useChangeLanguage()
    const {i18n} = useTranslation()

    useEffect(() => {
        i18n.changeLanguage(lang)
    }, [initLang]);

    const languageChanged = async (ls: LanguageSelectModel) => {
        await changeLang(ls.id).then(() => setLang(ls.id))
        await i18n.changeLanguage(ls.id)
    }

    return (
        <Select
            //@ts-ignore
            getOptionLabel={(ls: LanguageSelectModel) => <span>{ls.flag} {ls.pretty}</span>}
            getOptionValue={(ls: LanguageSelectModel) => ls.id}
            value={LanguagesSelect.find(l => l.id === lang)}
            className="w-52"
            //@ts-ignore
            onChange={languageChanged}
            options={LanguagesSelect}
        />
    );
}