import {ReactElement, useEffect} from "react";
import {useCanAutoLogin} from "@hooks/useCanAutoLogin.ts";
import {useLocation} from "wouter";

export default function LoginDispatch(): ReactElement {
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