import LanguageSelector from "./LanguageSelector.tsx";
import Select from "react-select/base";
import {useState} from "react";
import {useTranslation} from "react-i18next";

export default function Welcome() {
    const {t} = useTranslation()
    return (
        <div className="flex justify-center flex-col items-center">
            <h1 className="text-center text-4xl mb-4">{t('welcome')}</h1>
            <p>{t('welcome-msg')}</p>
            <LanguageSelector />
        </div>
    )
}