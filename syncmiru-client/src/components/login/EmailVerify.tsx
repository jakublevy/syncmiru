import {ReactElement, useEffect} from "react";
import Card from "@components/widgets/Card.tsx";
import {BtnTextPrimary} from "@components/widgets/Buttons.tsx";
import {useLocation} from "wouter";
import {useHistoryState} from "wouter/use-browser-location";
import {VerifyEmailHistoryState} from "@models/historyState.ts";
import {useWatchVerify} from "@hooks/useWatchVerify.tsx";
import {useReqVerificationEmail} from "@hooks/useReqVerificationEmail.ts";
import {StatusAlertService} from "react-status-alert";

export default function EmailVerify({waitBeforeResend}: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {email}: VerifyEmailHistoryState = useHistoryState()
    const {error: verEmailError} = useReqVerificationEmail(email)
    const {data: isVerified} = useWatchVerify(email)

    useEffect(() => {
        if(isVerified)
            navigate('/email-verified')
    }, [isVerified]);

    useEffect(() => {
        if(verEmailError !== undefined)
            StatusAlertService.showError(`Chyba: ${verEmailError}`)
    }, [verEmailError]);

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[25rem] w-[40rem] m-3">
                <h1 className="text-4xl mb-4">Ověření emailu</h1>
                <p>Váš účet byl vytvořen. Na uvedenou emailovou adresu <b>{email}</b> byl odeslán ověřující email
                    obsahující odkaz, jehož otevřením dojde k verifikace emailu a aktivaci účtu.</p>
                <div className="mt-4">
                    <BtnTextPrimary>Email nepřišel?</BtnTextPrimary>
                </div>
            </Card>
        </div>
    )
}

interface Props {
    waitBeforeResend: number
}