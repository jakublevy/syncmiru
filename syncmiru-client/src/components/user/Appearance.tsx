import {ReactElement} from "react";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import LanguageSelector from "@components/widgets/LanguageSelector.tsx";
import ThemeSelector from "@components/widgets/ThemeSelector.tsx";
import {useTranslation} from "react-i18next";

export default function Appearance(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('user-settings-appearance-title')}</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
            <div className="flex flex-col m-8">
                <div className="flex items-center">
                    <p>{t('language')}</p>
                    <div className="flex-1"></div>
                    <LanguageSelector/>
                </div>
                <hr className="mt-6"/>
            </div>
            <div className="flex flex-col m-8">
                <div className="flex items-center">
                    <p>{t('user-settings-appearance-theme')}</p>
                    <div className="flex-1"></div>
                    <ThemeSelector/>
                </div>
                <hr className="mt-6"/>
            </div>
        </div>
    )
}