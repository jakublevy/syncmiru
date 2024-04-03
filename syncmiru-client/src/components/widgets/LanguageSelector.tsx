import {ReactElement, useEffect} from 'react'

import Select from "react-select";
import {LanguagesSelect, LanguageSelectModel} from "@models/config.tsx";
import {useChangeLanguage, useLanguage} from '@hooks/useLanguage.ts'
import {useTranslation} from "react-i18next";

export default function LanguageSelector({className}: Props): ReactElement {
    const {data: lang, mutate: mutateLang} = useLanguage()
    const {trigger: changeLang} = useChangeLanguage()
    const {i18n} = useTranslation()

    useEffect(() => {
        i18n.changeLanguage(lang)
    }, [lang]);

    const languageChanged = async (ls: LanguageSelectModel) => {
        await changeLang(ls.id).then(() => {
            mutateLang(ls.id)
            i18n.changeLanguage(ls.id)
        })
    }

    return (
        <Select
            //@ts-ignore
            getOptionLabel={(ls: LanguageSelectModel) => <span>{ls.flag} {ls.pretty}</span>}
            getOptionValue={(ls: LanguageSelectModel) => ls.id}
            value={LanguagesSelect.find(l => l.id === lang)}
            classNamePrefix="my-react-select"
            className={`w-52 my-react-select-container ${className}`}
            //@ts-ignore
            onChange={languageChanged}
            options={LanguagesSelect}
        />
    );
}

interface Props {
    className?: string
}