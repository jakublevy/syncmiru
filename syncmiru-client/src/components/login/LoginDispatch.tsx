import {ReactElement, useEffect} from "react";
import {useCanAutoLogin} from "@hooks/useCanAutoLogin.ts";
import {useLocation} from "wouter";
import {useSetFirstRunSeen} from "@hooks/useFirstRunSeen.ts";

export default function LoginDispatch(): ReactElement {
    useSetFirstRunSeen()
    const [_, navigate] = useLocation()
    const canAutoLogin = useCanAutoLogin()

    useEffect(() => {
        if(canAutoLogin)
            navigate('/login-auto')
        else
            navigate('/login-form/main')
    }, [canAutoLogin]);

    return <></>
}