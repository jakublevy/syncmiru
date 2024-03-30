import React, {ReactElement} from "react";
import Danger from "../../svg/Danger.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {refresh} from "@mittwald/react-use-promise";
import {useErrorBoundary} from "react-error-boundary";
import {useTranslation} from "react-i18next";

export default function MpvDownloadFailed(): ReactElement {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const { resetBoundary } = useErrorBoundary();
    function downloadMpvAgain() {
        resetBoundary()
        refresh({error: true})
        if(location.pathname === "/mpv-download")
            navigate('/mpv-download-again')
        else
            navigate('/mpv-download')
    }

    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col items-center p-4 border-4 m-4">
                <h1 className="text-center text-4xl mb-4">{t('mpv-download-failed-title')}</h1>
                <p className="mb-8">{t('mpv-download-failed-reason')}</p>
                <Danger width="5rem" />
                <button className="btn-primary mt-8" onClick={downloadMpvAgain}>{t('dep-download-failed-btn')}</button>
            </div>
        </div>
    )
}