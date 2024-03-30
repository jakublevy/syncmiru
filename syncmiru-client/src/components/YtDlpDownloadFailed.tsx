import React, {ReactElement} from "react";
import Danger from "./svg/Danger.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {refresh} from "@mittwald/react-use-promise";
import {useErrorBoundary} from "react-error-boundary";

export default function YtDlpDownloadFailed(): ReactElement {
    const navigate = useNavigate()
    const location = useLocation()
    const { resetBoundary } = useErrorBoundary();
    function downloadYtDlpAgain() {
        resetBoundary()
        refresh({error: true})
        if(location.pathname === "/yt-dlp-download")
            navigate('/yt-dlp-download-again')
        else
            navigate('/yt-dlp-download')
    }

    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col items-center p-4 border-4 m-4">
                <h1 className="text-center text-4xl mb-4">Chyba při stahování yt-dlp</h1>
                <p className="mb-8">Při stahování yt-dlp došlo ke ztrátě spojení.</p>
                <Danger width="5rem" />
                <button className="btn-primary mt-8" onClick={downloadYtDlpAgain}>Stáhnout znovu</button>
            </div>
        </div>
    )
}