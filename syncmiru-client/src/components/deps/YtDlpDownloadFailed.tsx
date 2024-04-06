import React, {ReactElement} from "react";
import Danger from "@components/svg/Danger.tsx";
import {refresh} from "@mittwald/react-use-promise";
import {useErrorBoundary} from "react-error-boundary";
import {useTranslation} from "react-i18next";
import {BtnPrimary} from "@components/widgets/Buttons.tsx";
import {useLocation} from "wouter";
import Card from "@components/widgets/Card.tsx";
import {TrampolineHistoryState} from "@models/historyState.ts";

export default function YtDlpDownloadFailed(): ReactElement {
    const {t} = useTranslation()
    const [location, navigate] = useLocation()
    const { resetBoundary } = useErrorBoundary();
    function downloadYtDlpAgain() {
        resetBoundary()
        refresh({error: true})
        navigate('/reload', {state: {to: location} as TrampolineHistoryState})
    }

    return (
        <div className="flex justify-center items-center h-dvh">
            <Card className="flex flex-col items-center m-8">
                <h1 className="text-center text-4xl mb-4">{t('yt-dlp-download-failed-title')}</h1>
                <p className="mb-8">{t('yt-dlp-download-failed-reason')}</p>
                <Danger className="w-20" />
                <BtnPrimary className="mt-8" onClick={downloadYtDlpAgain}>{t('dep-download-failed-btn')}</BtnPrimary>
            </Card>
        </div>
    )
}