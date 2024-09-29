import {ReactElement, useEffect, useState} from "react";
import Card from "@components/widgets/Card.tsx";
import {useLocation} from "wouter";
import {useHistoryState} from "wouter/use-browser-location";
import {VerifyEmailHistoryState} from "@models/historyState.ts";
import {useWatchVerify} from "@hooks/useWatchVerify.tsx";
import {useReqVerificationEmail} from "@hooks/useReqVerificationEmail.ts";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import Loading from "@components/Loading.tsx";
import {useTranslation} from "react-i18next";
import {StatusAlertService} from "react-status-alert";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";

export default function EmailVerify({waitBeforeResend}: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const {email}: VerifyEmailHistoryState = useHistoryState()
    const reqVerEmailAgain = useReqVerificationEmail()
    const {data: isVerified} = useWatchVerify(email)
    const [loading, setLoading] = useState<boolean>(false)
    const [resendTimeout , setResendTimeout] = useState<number>(waitBeforeResend)

    useEffect(() => {
        setLoading(true)
        reqVerEmailAgain(email)
            .then(() => {
                setResendTimeout(waitBeforeResend)
                StatusAlertService.showSuccess(t('new-email-has-been-sent-msg'))
                setLoading(false)
            })
            .catch(() => {
                showPersistentErrorAlert(t('login-email-not-verified-too-many-attempts'))
                navigateToLoginFormMain(navigate)
            })
    }, []);

    useEffect(() => {
        if(isVerified)
            navigate('/email-verified')
    }, [isVerified]);

    function resendEmail() {
        setLoading(true)
        reqVerEmailAgain(email)
            .then(() => {
                setResendTimeout(waitBeforeResend)
                StatusAlertService.showSuccess(t('new-email-has-been-sent-msg'))
            })
            .catch(() => {
                setResendTimeout(0)
                showPersistentErrorAlert(t('email-send-error'))
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