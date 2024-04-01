import React, {ReactElement} from "react";
import Danger from "@components/svg/Danger.tsx";
import {refresh} from "@mittwald/react-use-promise";
import {useErrorBoundary} from "react-error-boundary";
import {useTranslation} from "react-i18next";
import {BtnPrimary} from "@components/widgets/Buttons.tsx";
import {useLocation} from "wouter";

export default function YtDlpDownloadFailed(): ReactElement {
    const {t} = useTranslation()
    const [location, navigate] = useLocation()
    const { resetBoundary } = useErrorBoundary();
    function downloadYtDlpAgain() {
        resetBoundary()
        refresh({error: true})
        navigate('/reload', {state: {to: location}})
    }

    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col items-center p-4 border-4 m-4">
                <h1 className="text-center text-4xl mb-4">{t('yt-dlp-download-failed-title')}</h1>
                <p className="mb-8">{t('yt-dlp-download-failed-reason')}</p>
                <Danger width="5rem" />
                <BtnPrimary className="mt-8" onClick={downloadYtDlpAgain}>{t('dep-download-failed-btn')}</BtnPrimary>
            </div>
        </div>
    )
}