import {ReactElement, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function UsernameView(p: Props): ReactElement {
    const {t} = useTranslation()
    const {users, uid} = useMainContext()
    const [username, setUsername] = useState<string>("")

    useEffect(() => {
        const user = users.get(uid)
        if(user !== undefined)
            setUsername(user.username)

        p.setLoading(false)
    }, [users]);

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