import {ReactElement, useEffect} from "react";
import {useCanAutoLogin} from "@hooks/useCanAutoLogin.ts";
import {useNavigate} from "react-router-dom";

export default function LoginDispatch(): ReactElement {
    const navigate = useNavigate()
    const canAutoLogin = useCanAutoLogin()

    useEffect(() => {
        if(canAutoLogin)
            navigate('/login-auto')
        else
            navigate('/login-form')
    }, [canAutoLogin]);

    return <></>
}