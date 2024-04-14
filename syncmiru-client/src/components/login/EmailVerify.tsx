import {ReactElement, useEffect, useState} from "react";
import Card from "@components/widgets/Card.tsx";
import {useLocation} from "wouter";
import {useHistoryState} from "wouter/use-browser-location";
import {VerifyEmailHistoryState} from "@models/historyState.ts";
import {useWatchVerify} from "@hooks/useWatchVerify.tsx";
import {useReqVerificationEmail} from "@hooks/useReqVerificationEmail.ts";
import {showErrorAlert, showSuccessAlert} from "src/utils/alert.ts";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import {invoke} from "@tauri-apps/api/core";
import Loading from "@components/Loading.tsx";

export default function EmailVerify({waitBeforeResend}: Props): ReactElement {
    const [_, navigate] = useLocation()
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
            showErrorAlert(verEmailError)
    }, [verEmailError]);

    function resendEmail() {
        setLoading(true)
        invoke<void>('req_verification_email', {email: email})
            .then(() => {
                setLoading(false)
                setResendTimeout(waitBeforeResend)
                showSuccessAlert("Nový email byl odeslán")
            })
            .catch((e) => {
                setLoading(false)
                setResendTimeout(0)
                showErrorAlert(e)
            })
    }

    if(loading)
        return <Loading/>

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[25rem] w-[40rem] m-3">
                <h1 className="text-4xl mb-4">Ověření emailu</h1>
                <p>Váš účet byl vytvořen. Na uvedenou emailovou adresu <b>{email}</b> byl odeslán ověřující email
                    obsahující odkaz, jehož otevřením dojde k verifikace emailu a aktivaci účtu.</p>
                <div className="mt-4">
                    <BtnTimeout onClick={resendEmail} text="Email nepřišel?" timeout={resendTimeout}/>
                </div>
            </Card>
        </div>
    )
}

interface Props {
    waitBeforeResend: number
}