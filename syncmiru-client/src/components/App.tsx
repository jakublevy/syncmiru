import Welcome from "@components/Welcome.tsx";
import React, {ReactElement, useEffect} from "react";
import {useFirstRunSeen} from "@hooks/useFirstRunSeen.ts";
import {Route, useLocation, Router} from "wouter";
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
import {Language} from "@models/config.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";
import {useTranslation} from "react-i18next";
import RegisterDispatch from "@components/login/RegisterDispatch.tsx";
import {DepsHistoryState} from "@models/historyState.ts";
import EmailVerifyDispatch from "@components/login/EmailVerifyDispatch.tsx";
import EmailVerified from "@components/login/EmailVerified.tsx";


function App(): ReactElement {
    const {i18n} = useTranslation()
    const lang: Language = useLanguage()
    const firstRunSeen: boolean = useFirstRunSeen()
    const [_, navigate] = useLocation()

    useEffect(() => {
        i18n.changeLanguage(lang)
    }, [lang]);

    useEffect(() => {
        if (firstRunSeen)
            navigate('/deps', {state: {firstRunSeen: true} as DepsHistoryState})
        else
            navigate('/welcome')
    }, [firstRunSeen]);

    return (
        <Router>
            <Route path="/reload" component={Trampoline}/>
            <Route path="/welcome" component={Welcome}/>

            <Route path="/deps" component={Deps}/>
            <Route path="/mpv-download">
                <ErrorBoundary fallback={<MpvDownloadFailed/>}>
                    <MpvDownloading/>
                </ErrorBoundary>
            </Route>

            <Route path="/yt-dlp-download">
                <ErrorBoundary fallback={<YtDlpDownloadFailed/>}>
                    <YtDlpDownloading/>
                </ErrorBoundary>
            </Route>

            <Route path="/login-dispatch" component={LoginDispatch}/>
            <Route path="/login-auto" component={LoginAuto}/>
            <Route path="/login-form/*" component={LoginForm}/>
            <Route path="/register" component={RegisterDispatch}/>
            <Route path="/email-verify" component={EmailVerifyDispatch}/>
            <Route path="/email-verified" component={EmailVerified}/>
        </Router>
    )
}

export default App;
