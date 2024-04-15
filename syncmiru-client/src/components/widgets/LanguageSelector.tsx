import {ReactElement, useEffect, useState} from 'react'
import Select from "react-select";
import {LanguagesSelect, LanguageSelectModel, Language} from "@models/config.tsx";
import {useChangeLanguage, useLanguage} from '@hooks/useLanguage.ts'
import {useTranslation} from "react-i18next";
import {refresh} from "@mittwald/react-use-promise";


export default function LanguageSelector({className}: Props): ReactElement {
    const initLang: Language = useLanguage()
    const changeLang = useChangeLanguage()
    const {i18n} = useTranslation()
    const [lang, setLang] = useState<Language>(initLang)

    useEffect(() => {
        setLang(initLang)
        i18n.changeLanguage(initLang)

        return () => refresh({tag: "useLanguage"})
    }, [initLang]);

    const languageChanged = async (ls: LanguageSelectModel) => {
        await changeLang(ls.id).then(() => {
            setLang(ls.id)
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
            className={`w-52 my-react-select-container ${className != null ? className : ''}`}
            //@ts-ignore
            onChange={languageChanged}
            options={LanguagesSelect}
        />
    );
}

interface Props {
    className?: string
}