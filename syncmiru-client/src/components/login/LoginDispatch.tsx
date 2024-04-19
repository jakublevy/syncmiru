import {ReactElement, useEffect} from "react";
import {useCanAutoLogin} from "@hooks/useCanAutoLogin.ts";
import {useLocation} from "wouter";
import {useSetFirstRunSeen} from "@hooks/useFirstRunSeen.ts";
import {refresh} from "@mittwald/react-use-promise";
import {mutate} from "swr";

export default function LoginDispatch(): ReactElement {
    useSetFirstRunSeen()
    const [_, navigate] = useLocation()
    const canAutoLogin = useCanAutoLogin()

    useEffect(() => {
        refresh({tag: 'useCanAutoLogin'})
        if(canAutoLogin)
            mutate('login').then(() => navigate('/main'))
        else
            navigate('/login-form/main')
    }, [canAutoLogin]);

    return <></>
}