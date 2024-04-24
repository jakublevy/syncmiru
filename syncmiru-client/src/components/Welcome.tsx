import LanguageSelector from "@components/widgets/LanguageSelector.tsx";
import {useTranslation} from "react-i18next";
import {ReactElement} from "react";
import {useLocation} from "wouter";
import {refresh} from "@mittwald/react-use-promise";
import {BtnPrimary} from "@components/widgets/Button.tsx";
import Card from "@components/widgets/Card.tsx";
import {DepsHistoryState} from "@models/historyState.ts";
import {navigateToDeps} from "../utils/navigate.ts";

export default function Welcome(): ReactElement {
    const {t} = useTranslation()
    const [_, navigate] = useLocation()

    function navToDeps(): void {
        navigateToDeps(navigate, {firstRunSeen: false})
    }

    return (
        <div className="flex justify-center items-center mt-3 mb-3 ml-8 mr-8">
            <Card className="flex flex-col items-center p-4">
                <h1 className="text-center text-4xl mb-4">{t('welcome')}</h1>
                <p className="mb-8">{t('welcome-msg')}</p>
                <div className="mb-12">
                    <label>{t('language')}</label>
                    <LanguageSelector/>
                </div>
                <BtnPrimary onClick={navToDeps}>{t('continue')}</BtnPrimary>
            </Card>
        </div>
    )
}