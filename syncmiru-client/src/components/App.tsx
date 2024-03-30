import Welcome from "./Welcome.tsx";
import React, {ReactElement, useEffect} from "react";
import {useFirstRunSeen} from "../hooks/useFirstRunSeen.ts";
import {Route, Routes, useNavigate} from "react-router-dom";
import Main from "./Main.tsx";
import Deps from "./Deps.tsx";
import DepsAgain from "./DepsAgain.tsx";
import MpvDownloadWindows from "./MpvDownloadWindows.tsx";
import YtDlpDownloadWindows from "./YtDlpDownloadWindows.tsx";
import {ErrorBoundary} from "react-error-boundary";
import MpvDownloadFailed from "./MpvDownloadFailed.tsx";
import MpvDownloadAgainWindows from "./MpvDownloadAgainWindows.tsx";
import YtDlpDownloadAgainWindows from "./YtDlpDownloadAgainWindows.tsx";
import YtDlpDownloadFailed from "./YtDlpDownloadFailed.tsx";

function App(): ReactElement {
    const firstRunSeen: boolean = useFirstRunSeen()
    const navigate = useNavigate()

    useEffect(() => {
        if (firstRunSeen)
            navigate("/deps", {state: {firstRunSeen: true}})
        else
            navigate("/welcome")
    }, [firstRunSeen]);

    return (
        <Routes>
            <Route path="/welcome" element={<Welcome/>}/>
            <Route path="/main" element={<Main/>}/>
            <Route path="/deps" element={<Deps/>}/>
            <Route path="/deps-again" element={<DepsAgain/>}/>

            <Route path="/mpv-download" element={
                <ErrorBoundary fallback={<MpvDownloadFailed/>}>
                    <MpvDownloadWindows/>
                </ErrorBoundary>
            }/>
            <Route path="/mpv-download-again" element={
                <ErrorBoundary fallback={<MpvDownloadFailed/>}>
                    <MpvDownloadAgainWindows/>
                </ErrorBoundary>
            }/>

            <Route path="/yt-dlp-download" element={
                <ErrorBoundary fallback={<YtDlpDownloadFailed/>}>
                    <YtDlpDownloadWindows/>
                </ErrorBoundary>
            }/>

            <Route path="/yt-dlp-download-again" element={
                <ErrorBoundary fallback={<YtDlpDownloadFailed/>}>
                    <YtDlpDownloadAgainWindows/>
                </ErrorBoundary>
            }/>
        </Routes>
    )
}

export default App;
