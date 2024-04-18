import {ReactElement, useEffect} from "react";
import {useCanAutoLogin} from "@hooks/useCanAutoLogin.ts";
import {useLocation} from "wouter";
import {useSetFirstRunSeen} from "@hooks/useFirstRunSeen.ts";
import {refresh} from "@mittwald/react-use-promise";

export default function LoginDispatch(): ReactElement {
    useSetFirstRunSeen()
    const [_, navigate] = useLocation()
    const canAutoLogin = useCanAutoLogin()

    useEffect(() => {
        refresh({tag: 'useCanAutoLogin'})
        if(canAutoLogin)
            navigate('/login')
        else
            navigate('/login-form/main')
    }, [canAutoLogin]);

    return <></>
}