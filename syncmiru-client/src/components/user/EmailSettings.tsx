import {ReactElement, useEffect, useState} from "react";
import {EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function EmailSettings(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [email, setEmail] = useState<string>("")

    useEffect(() => {
        if(socket !== undefined) {
            socket.on('my_email', onMyEmail)
            socket.emit("req_my_email")
        }
    }, [socket]);

    function onMyEmail(email: string) {
        setEmail(email)
        p.onEmailLoaded()
    }

    return (
        <div className="flex items-center">
            <p className="w-56">{t('user-settings-account-email-label')}</p>
            <p className="font-bold">{email}</p>
            <div className="flex-1"></div>
            <EditBtn className="w-10"/>
        </div>
    )
}

interface Props {
    onEmailLoaded: () => void
}