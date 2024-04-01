import Welcome from "@components/Welcome.tsx";
import React, {ReactElement, useEffect} from "react";
import {useFirstRunSeen} from "@hooks/useFirstRunSeen.ts";
import {Route, Routes, useNavigate} from "react-router-dom";
import LoginDispatch from "@components/login/LoginDispatch.tsx";
import Deps from "@components/deps/Deps.tsx";
import MpvDownloading from "@components/deps/windows/MpvDownloading.tsx";
import YtDlpDownloading from "@components/deps/windows/YtDlpDownloading.tsx";
import {ErrorBoundary} from "react-error-boundary";
import MpvDownloadFailed from "@components/deps/windows/MpvDownloadFailed.tsx";
import YtDlpDownloadFailed from "@components/deps/YtDlpDownloadFailed.tsx";
import Trampoline from "@components/Trampoline.tsx";
import LoginAuto from "@components/login/LoginAuto.tsx";
import LoginForm from "@components/login/LoginForm.tsx";
import HomeServer from "@components/login/HomeServer.tsx";
import TestComponent from "@components/TestComponent.tsx";

function App(): ReactElement {
    const firstRunSeen: boolean = useFirstRunSeen()
    const navigate = useNavigate()

    useEffect(() => {
        if (firstRunSeen)
            navigate("/deps", {state: {firstRunSeen: true}})
        else
            navigate("/welcome", )
    }, [firstRunSeen]);

    return (
        <Routes>
            <Route path="/reload" element={<Trampoline/>}/>
            <Route path="/welcome" element={<Welcome/>}/>
            <Route path="/deps" element={<Deps/>}/>

            <Route path="/mpv-download" element={
                <ErrorBoundary fallback={<MpvDownloadFailed/>}>
                    <MpvDownloading/>
                </ErrorBoundary>
            }/>

            <Route path="/yt-dlp-download" element={
                <ErrorBoundary fallback={<YtDlpDownloadFailed/>}>
                    <YtDlpDownloading/>
                </ErrorBoundary>
            }/>

            <Route path="/login-dispatch" element={<LoginDispatch/>}/>
            <Route path="/login-auto" element={<LoginAuto/>}/>
            <Route path="/login-form" element={<LoginForm/>}>
                <Route path="home-server" element={<HomeServer/>}/>
            </Route>
        </Routes>
    )
}

export default App;
