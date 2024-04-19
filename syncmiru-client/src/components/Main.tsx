import {ReactElement, useEffect} from "react";
import {useLogin} from "@hooks/useLogin.ts";
import {useLocation} from "wouter";
import {Event, listen} from "@tauri-apps/api/event";
import {showErrorAlert} from "src/utils/alert.ts";
import {useTranslation} from "react-i18next";

export default function Main(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
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
    }, []);

    return <div>Main component</div>
}