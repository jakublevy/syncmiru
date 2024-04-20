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

export default function Main(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
    const [reconnecting, setReconnecting] = useState<boolean>(false)
    const {error: loginError} = useLogin()

    useEffect(() => {
        if(loginError !== undefined)
            navigate('/login-form/main')
    }, [loginError]);

    useEffect(() => {
        listen<void>('auth-error', (e: Event<void>) => {
            showErrorAlert(t('login-jwt-invalid'))
            navigate('/login-form/main')
        })

        listen<void>('conn-error', (e: Event<void>) => {
            setReconnecting(true)
        })
        listen<void>('conn-open', (e: Event<void>) => {
            setReconnecting(false)
        })
    }, []);

    if(reconnecting)
        return <Reconnecting/>

    return (
        <div className="flex w-dvw">
            <div className="flex flex-col min-w-60 w-60">
                <SrvInfo/>
                <Rooms/>
                <JoinedRoom/>
                <CurrentUser/>
            </div>
            <div className="border flex-1 min-w-60">C2</div>
            <div className="border min-w-60 w-60">C3</div>
        </div>
    )
}