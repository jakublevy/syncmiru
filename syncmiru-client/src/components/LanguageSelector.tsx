import Select from 'react-select';
import {LanguagesSelect, LanguageSelectModel} from "../models/config.tsx";
import useLanguage from "../hooks/useLanguage.ts";
import {useTranslation} from "react-i18next";


export default function LanguageSelector() {
    const [lang, setLang] = useLanguage()
    const {i18n} = useTranslation()

    const languageChanged = async (ls: LanguageSelectModel) => {
        await setLang(ls.id)
        await i18n.changeLanguage(ls.id)
    }

    if(lang !== undefined) {
        return (
            <div className="vehicle-picker">
                {}
                <Select
                    //@ts-ignore
                    getOptionLabel={(ls: LanguageSelectModel) => <span>{ls.flag} {ls.pretty}</span>}
                    getOptionValue={(ls: LanguageSelectModel) => ls.id}
                    value={LanguagesSelect.find(l => l.id === lang)}

                    //@ts-ignore
                    onChange={languageChanged}
                    options={LanguagesSelect}
                />
            </div>
        );
    }
    return (
        <div>Loading</div>
    )
}