import Welcome from "@components/Welcome.tsx";
import React, {ReactElement, useEffect} from "react";
import {useFirstRunSeen} from "@hooks/useFirstRunSeen.ts";
import {Route, Routes, useNavigate} from "react-router-dom";
import Main from "@components/Main.tsx";
import Deps from "@components/deps/Deps.tsx";
import DepsAgain from "@components/deps/DepsAgain.tsx";
import MpvDownloading from "@components/deps/windows/MpvDownloading.tsx";
import YtDlpDownloading from "@components/deps/windows/YtDlpDownloading.tsx";
import {ErrorBoundary} from "react-error-boundary";
import MpvDownloadFailed from "@components/deps/windows/MpvDownloadFailed.tsx";
import MpvDownloadingAgain from "@components/deps/windows/MpvDownloadingAgain.tsx";
import YtDlpDownloadAgain from "@components/deps/windows/YtDlpDownloadAgain.tsx";
import YtDlpDownloadFailed from "@components/deps/YtDlpDownloadFailed.tsx";

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
                    <MpvDownloading/>
                </ErrorBoundary>
            }/>
            <Route path="/mpv-download-again" element={
                <ErrorBoundary fallback={<MpvDownloadFailed/>}>
                    <MpvDownloadingAgain/>
                </ErrorBoundary>
            }/>

            <Route path="/yt-dlp-download" element={
                <ErrorBoundary fallback={<YtDlpDownloadFailed/>}>
                    <YtDlpDownloading/>
                </ErrorBoundary>
            }/>

            <Route path="/yt-dlp-download-again" element={
                <ErrorBoundary fallback={<YtDlpDownloadFailed/>}>
                    <YtDlpDownloadAgain/>
                </ErrorBoundary>
            }/>
        </Routes>
    )
}

export default App;
