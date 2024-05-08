import {ReactElement, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function UsernameView(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [username, setUsername] = useState<string>("")

    useEffect(() => {
        if(socket !== undefined) {
            socket.emitWithAck("get_my_username")
                .then((username) => setUsername(username))
                .catch(() => setUsername("N/A"))
                .finally(() => p.setLoading(false))
        }
    }, [socket]);

    return (
        <div className="flex items-center">
            <p className="w-56">{t('user-settings-account-username-label')}</p>
            <p className="font-bold">{username}</p>
        </div>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}