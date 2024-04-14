import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import Card from "@components/widgets/Card.tsx";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import Help from "@components/widgets/Help.tsx";
import {ForgottenPasswordTknSrvValidate, Input} from "@components/widgets/Input.tsx";
import {LoginFormHistoryState} from "@models/historyState.ts";
import {BackButton} from "@components/widgets/Button.tsx";
import {useLocation} from "wouter";
import {useReqForgottenPasswordEmail} from "@hooks/useReqForgottenPasswordEmail.ts";
import {showErrorAlert, showSuccessAlert} from "../../utils/alert.ts";
import Loading from "@components/Loading.tsx";
import {invoke} from "@tauri-apps/api/core";

export default function ForgottenPassword({email, waitBeforeResend}: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {error: fpError, isLoading: fpIsLoading} = useReqForgottenPasswordEmail(email)
    const [loading, setLoading] = useState<boolean>(false)
    const [resendTimeout , setResendTimeout] = useState<number>(waitBeforeResend)
    const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false)
    const [showTknError, setShowTknError] = useState<boolean>(false)
    const [tkn, setTkn] = useState<string>("")

    useEffect(() => {
        setLoading(fpIsLoading)
    }, [fpIsLoading]);

    useEffect(() => {
        if(fpError !== undefined) {
            showErrorAlert(fpError)
            setResendTimeout(0)
        }
        else {
            setResendTimeout(waitBeforeResend)
        }
    }, [fpError]);

    function backButtonClicked() {
        navigate("/login-form/main", {state: {email: email} as LoginFormHistoryState})
    }

    function resendEmail() {
        setLoading(true)
        invoke<void>('req_forgotten_password_email', {email: email})
            .then(() => {
                setLoading(false)
                setResendTimeout(waitBeforeResend)
                showSuccessAlert("Nový email byl odeslán")
                setTkn('')
            })
            .catch((e) => {
                setLoading(false)
                setResendTimeout(0)
                showErrorAlert(e)
            })
    }

    function tknValidChanged(valid: boolean) {
        setShowTknError(!valid)
        setShowPasswordFields(!valid)
    }

    function tknChanged(e: ChangeEvent<HTMLInputElement>) {
        setTkn(e.target.value)
        setShowTknError(e.target.value.length > 0)
    }

    if(loading)
        return <Loading/>

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[25rem] w-[40rem] m-3">
                <div className="flex items-start">
                    <BackButton onClick={backButtonClicked} className="mr-4"/>
                    <h1 className="text-4xl mb-4">Ověření emailu</h1>
                </div>
                <p>Pokud byl nalezen účet, tak na uvedenou emailovou adresu <b>{email}</b> byl odeslán ověřující email
                    obsahující 24 místný kód, který pro změnu hesla vložte níže.</p>
                <div className="mt-4 mb-4">
                    <BtnTimeout text="Email nepřišel?" timeout={resendTimeout} onClick={resendEmail} />
                </div>
                <div className="mt-4">
                    <div className="flex justify-between">
                        <label htmlFor="token" className="block mb-1 text-sm font-medium">Kód pro ověření</label>
                        <Help
                            tooltipId="token-help"
                            className="w-4"
                            content="Sem vložte 24 místný kód pro ověření vašeho emailu."
                        />
                    </div>
                    <ForgottenPasswordTknSrvValidate
                        type="text"
                        id="token"
                        value={tkn}
                        onSrvValidationChanged={tknValidChanged}
                        onChange={tknChanged}
                        maxLength={24}
                    />
                    {showTknError
                        ? <p className="text-danger font-semibold">Neplatný token</p>
                        : <p className="text-danger invisible font-semibold">L</p>
                    }
                </div>
            </Card>
        </div>
    )
}

interface Props {
    email: string
    waitBeforeResend: number
}