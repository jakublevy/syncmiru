import React, {ReactElement} from "react";
import Danger from "@components/svg/Danger.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {refresh} from "@mittwald/react-use-promise";
import {useErrorBoundary} from "react-error-boundary";
import {useTranslation} from "react-i18next";

export default function YtDlpDownloadFailed(): ReactElement {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { resetBoundary } = useErrorBoundary();
    function downloadYtDlpAgain() {
        resetBoundary()
        refresh({error: true})
        navigate('/reload', {state: {to: location.pathname}})
    }

    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col items-center p-4 border-4 m-4">
                <h1 className="text-center text-4xl mb-4">{t('yt-dlp-download-failed-title')}</h1>
                <p className="mb-8">{t('yt-dlp-download-failed-reason')}</p>
                <Danger width="5rem" />
                <button className="btn-primary mt-8" onClick={downloadYtDlpAgain}>{t('dep-download-failed-btn')}</button>
            </div>
        </div>
    )
}