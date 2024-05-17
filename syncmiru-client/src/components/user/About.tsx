import {ReactElement} from "react";
import {BtnTextPrimary, CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import {SYNCMIRU_VERSION} from "src/utils/constants.ts";

export default function About(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('user-settings-about-title')}</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                <div className="flex items-center">
                    <p className="w-56">{t('user-settings-about-version-label')}</p>
                    <p className="font-bold">Syncmiru {SYNCMIRU_VERSION}</p>
                </div>
                <div className="flex items-center">
                    <p className="w-56">Verze mpv</p>
                    <p className="font-bold">mpv v0.37.0</p>
                </div>
                <div className="flex items-center">
                    <p className="w-56">Verze yt-dlp</p>
                    <p className="font-bold">yt-dlp 2024.03.10</p>
                </div>
            </div>
            <hr/>
            <div className="ml-8 mr-8 mt-8">
                <BtnTextPrimary>
                    Zobrazit licence
                </BtnTextPrimary>
            </div>
        </div>
    )
}