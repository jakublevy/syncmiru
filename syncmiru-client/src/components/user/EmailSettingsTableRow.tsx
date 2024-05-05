import {ReactElement, useEffect, useState} from "react";
import {EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function EmailSettingsTableRow(p: Props): ReactElement {
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
        <tr>
            <td>{t('user-settings-account-email-label')}</td>
            <td className="font-bold">{email}</td>
            <td className="text-right">
                <EditBtn className="w-10"/>
            </td>
        </tr>
    )
}

interface Props {
    onEmailLoaded: () => void
}