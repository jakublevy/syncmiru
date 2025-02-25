import {ReactElement, useEffect, useState} from "react";
import {PacmanLoader} from "react-spinners";
import {BtnSecondary} from "@components/widgets/Button.tsx";
import {useLocation} from "wouter";
import Loading from "@components/Loading.tsx";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";
import useClearJwt from "@hooks/useClearJwt.ts";
import {useTranslation} from "react-i18next";
import {invoke} from "@tauri-apps/api/core";
import {useMainContext} from "@hooks/useMainContext.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function Reconnecting(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const clearJwt = useClearJwt()
    const [loading, setLoading] = useState<boolean>(false)
    const {setMpvRunning} = useMainContext()

    useEffect(() => {
        invoke('mpv_quit', {})
            .then(() => {
                setMpvRunning(false)
            })
            .catch(() => {
                invoke('kill_app_with_error_msg', {msg: t('mpv-quit-error')})
                    .catch(() => {
                        showPersistentErrorAlert(t('kill-app-failed'))
                    })
            })
    }, []);

    function signout() {
        setLoading(true)
        clearJwt().then(() => navigateToLoginFormMain(navigate))
    }

    if(loading)
        return <Loading/>

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-grow flex-col justify-end items-center">
                <PacmanLoader color="rgb(99 102 241)"/>
                <h1 className="text-2xl">{t('reconnecting-header')}</h1>
                <p className="mt-2 font-light">{t('reconnecting-text')}</p>
            </div>
            <div className="flex-grow flex flex-col justify-end items-center mb-4">
                <p className="mb-1">{t('reconnecting-failing')}</p>
                <BtnSecondary onClick={signout}>{t('sign-out')}</BtnSecondary>
            </div>
        </div>
    )
}