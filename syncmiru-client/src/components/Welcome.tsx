import LanguageSelector from "@components/widgets/LanguageSelector.tsx";
import {useTranslation} from "react-i18next";
import {ReactElement} from "react";
import {useLocation} from "wouter";
import {refresh} from "@mittwald/react-use-promise";
import {BtnPrimary} from "@components/widgets/Buttons.tsx";
import Card from "@components/widgets/Card.tsx";

export default function Welcome(): ReactElement {
    const {t} = useTranslation()
    const [location, navigate] = useLocation()

    function navigateToDeps(): void {
        refresh({tag: "useDepsState"})
        navigate("/deps", {state: {firstRunSeen: false}})
    }

    return (
        <div className="flex justify-center items-center h-dvh">
            <Card className="flex flex-col items-center p-4 m-8">
                <h1 className="text-center text-4xl mb-4">{t('welcome')}</h1>
                <p className="mb-8">{t('welcome-msg')}</p>
                <div className="mb-12">
                    <label>{t('language')}</label>
                    <LanguageSelector/>
                </div>
                <BtnPrimary onClick={navigateToDeps}>{t('continue')}</BtnPrimary>
            </Card>
        </div>
    )
}