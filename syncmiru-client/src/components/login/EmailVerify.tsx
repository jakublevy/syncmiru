import {ReactElement, useEffect, useState} from "react";
import Card from "@components/widgets/Card.tsx";
import {useLocation} from "wouter";
import {useHistoryState} from "wouter/use-browser-location";
import {VerifyEmailHistoryState} from "@models/historyState.ts";
import {useWatchVerify} from "@hooks/useWatchVerify.tsx";
import {useReqVerificationEmail} from "@hooks/useReqVerificationEmail.ts";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import {invoke} from "@tauri-apps/api/core";
import Loading from "@components/Loading.tsx";
import {useTranslation} from "react-i18next";
import {StatusAlertService} from "react-status-alert";

export default function EmailVerify({waitBeforeResend}: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const {email}: VerifyEmailHistoryState = useHistoryState()
    const {error: verEmailError, isLoading: verEmailIsLoading} = useReqVerificationEmail(email)
    const {data: isVerified} = useWatchVerify(email)
    const [loading, setLoading] = useState<boolean>(false)
    const [resendTimeout , setResendTimeout] = useState<number>(waitBeforeResend)

    useEffect(() => {
        setLoading(verEmailIsLoading)
    }, [verEmailIsLoading]);

    useEffect(() => {
        if(isVerified)
            navigate('/email-verified')
    }, [isVerified]);

    useEffect(() => {
        if(verEmailError !== undefined)
            StatusAlertService.showError(verEmailError)
    }, [verEmailError]);

    function resendEmail() {
        setLoading(true)
        invoke<void>('req_verification_email', {email: email})
            .then(() => {
                setResendTimeout(waitBeforeResend)
                StatusAlertService.showSuccess(t('new-email-has-been-sent-msg'))
            })
            .catch((e) => {
                setResendTimeout(0)
                StatusAlertService.showError(e)
            })
            .finally(() => setLoading(false))
    }

    if(loading)
        return <Loading/>

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[25rem] w-[40rem] m-3 p-6">
                <h1 className="text-4xl mb-4">{t('email-verify-title')}</h1>
                <p>{t('email-verify-text-1')} <b>{email}</b> {t('email-verify-text-2')}</p>
                <div className="mt-4">
                    <BtnTimeout onClick={resendEmail} text={t('email-not-received')} timeout={resendTimeout}/>
                </div>
            </Card>
        </div>
    )
}

interface Props {
    waitBeforeResend: number
}