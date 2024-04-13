import {ReactElement} from "react";
import Card from "@components/widgets/Card.tsx";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import Help from "@components/widgets/Help.tsx";
import {Input} from "@components/widgets/Input.tsx";
import {ForgottenPasswordHistoryState} from "@models/historyState.ts";
import {useHistoryState} from "wouter/use-browser-location";

export default function ForgottenPassword(): ReactElement {
    const {email}: ForgottenPasswordHistoryState = useHistoryState()

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[25rem] w-[40rem] m-3">
                <h1 className="text-4xl mb-4">Ověření emailu</h1>
                <p>Váš účet byl vytvořen. Na uvedenou emailovou adresu <b>{email}</b> byl odeslán ověřující email
                    obsahující 24 místný kód, který pro dokončení registrace vložte níže.</p>
                <div className="mt-4 mb-4">
                    <BtnTimeout text="Email nepřišel?" timeout={600}/>
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