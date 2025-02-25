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
import LoginForm from "@components/login/LoginForm.tsx";
import {Language} from "@models/config.tsx";
import {useChangeLanguage, useLanguage} from "@hooks/useLanguage.ts";
import {useTranslation} from "react-i18next";
import EmailVerified from "@components/login/EmailVerified.tsx";
import RegisterDispatch from "@components/login/RegisterDispatch.tsx";
import EmailVerifyDispatch from "@components/login/EmailVerifyDispatch.tsx";
import ForgottenPasswordDispatch from "@components/login/ForgottenPasswordDispatch.tsx";
import ForgottenPasswordChanged from "@components/login/ForgottenPasswordChanged.tsx";
import DepsUpdate from "@components/deps/windows/DepsUpdate.tsx";
import Main from "@components/Main.tsx";
import {navigateToDeps, navigateToWelcome} from "src/utils/navigate.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";


export default function App(): ReactElement {
    const {i18n, t} = useTranslation()
    const lang: Language = useLanguage()
    const changeLang = useChangeLanguage()
    const firstRunSeen: boolean = useFirstRunSeen()
    const [_, navigate] = useLocation()

    useEffect(() => {
        i18n.changeLanguage(lang)
            .then(() => {
                changeLang(lang).catch(() => {
                    showPersistentErrorAlert(t('language-change-failed'))
                })
            })
            .catch(() => {
                showPersistentErrorAlert(t('language-change-failed'))
            })
    }, [lang]);

    useEffect(() => {
        if (firstRunSeen)
            navigateToDeps(navigate, {firstRunSeen: true})
        else {
            navigateToWelcome(navigate)
        }
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
            <Route path="/deps-update" component={DepsUpdate}/>

            <Route path="/login-dispatch" component={LoginDispatch}/>
            <Route path="/login-form/*" component={LoginForm}/>
            <Route path="/register" component={RegisterDispatch}/>
            <Route path="/email-verify" component={EmailVerifyDispatch}/>
            <Route path="/email-verified" component={EmailVerified}/>
            <Route path="/forgotten-password" component={ForgottenPasswordDispatch}/>
            <Route path="/forgotten-password-changed" component={ForgottenPasswordChanged}/>

            <Route path="/main/*" component={Main}/>
        </Router>
    )
}
