import {ReactElement, useEffect} from "react";
import Card from "@components/widgets/Card.tsx";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import Help from "@components/widgets/Help.tsx";
import {Input} from "@components/widgets/Input.tsx";
import {LoginFormHistoryState} from "@models/historyState.ts";
import {BackButton} from "@components/widgets/Buttons.tsx";
import {useLocation} from "wouter";
import {useReqForgottenPasswordEmail} from "@hooks/useReqForgottenPasswordEmail.ts";
import {showErrorAlert} from "../../utils/alert.ts";

export default function ForgottenPassword({email, waitBeforeResend}: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {error: forgottenPasswordEmailError} = useReqForgottenPasswordEmail(email)

    useEffect(() => {
        if(forgottenPasswordEmailError !== undefined)
            showErrorAlert(forgottenPasswordEmailError)
    }, [forgottenPasswordEmailError]);

    function backButtonClicked() {
        navigate("/login-form/main", {state: {email: email} as LoginFormHistoryState})
    }

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
                    <BtnTimeout text="Email nepřišel?" timeout={waitBeforeResend}/>
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
                    <Input
                        type="text"
                        id="token"
                        maxLength={24}
                    />
                </div>
            </Card>
        </div>
    )
}

interface Props {
    email: string
    waitBeforeResend: number
}