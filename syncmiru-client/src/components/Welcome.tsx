import LanguageSelector from "./LanguageSelector.tsx";
import {useTranslation} from "react-i18next";
import {ReactElement, Suspense} from "react";

export default function Welcome(): ReactElement {
    const {t} = useTranslation()
    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col items-center p-4 border-4 m-4">
                <h1 className="text-center text-4xl mb-4">{t('welcome')}</h1>
                <p className="mb-8">{t('welcome-msg')}</p>
                <div className="mb-12">
                    <label>Jazyk</label>
                    <LanguageSelector />
                </div>
                <button className="btn-indigo">{t('continue')}</button>
            </div>
        </div>
    )
}