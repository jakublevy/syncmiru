import {ReactElement, useEffect, useState} from "react";
import {useLogin} from "@hooks/useLogin.ts";
import {useLocation} from "wouter";
import {Event, listen} from "@tauri-apps/api/event";
import {showErrorAlert} from "src/utils/alert.ts";
import {useTranslation} from "react-i18next";
import Reconnecting from "@components/Reconnecting.tsx";
import SrvInfo from "@components/SrvInfo.tsx";
import Rooms from "@components/Rooms.tsx";
import JoinedRoom from "@components/JoinedRoom.tsx";
import CurrentUser from "@components/CurrentUser.tsx";
import ButtonPanel from "@components/ButtonPanel.tsx";
import Middle from "@components/Middle.tsx";
import Loading from "@components/Loading.tsx";
import {invoke} from "@tauri-apps/api/core";

export default function Main(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const [reconnecting, setReconnecting] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        listen<void>('auth-error', (e: Event<void>) => {
            showErrorAlert(t('login-jwt-invalid'))
            invoke<void>('socketio_drop').then(() => navigate('/login-form/main'))
        })

        listen<void>('conn-error', (e: Event<void>) => {
            setReconnecting(true)
        })
        listen<void>('conn-open', (e: Event<void>) => {
            setReconnecting(false)
            setLoading(false)
        })
    }, []);

    const {error: loginError} = useLogin()
    useEffect(() => {
        if (loginError !== undefined) {
            showErrorAlert(t('login-failed'))
            invoke<void>('socketio_drop').then(() => navigate('/login-form/main'))
        }
    }, [loginError]);

    if (reconnecting)
        return <Reconnecting/>

    if (loading)
        return <Loading/>

    return (
        <div className="flex w-dvw">
            <div className="flex flex-col min-w-60 w-60">
                <SrvInfo/>
                <Rooms/>
                <JoinedRoom/>
                <CurrentUser/>
            </div>
            <div className="border flex-1 min-w-60">
                <div className="flex flex-col h-full">
                    <ButtonPanel/>
                    <Middle/>
                </div>
            </div>
            <div className="border min-w-60 w-60">C3</div>
        </div>
    )
}