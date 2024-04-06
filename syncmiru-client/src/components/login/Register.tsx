import {ReactElement, useEffect} from "react";
import {useServiceStatus} from "@hooks/useServiceStatus.ts";
import RegisterCaptcha from "@components/login/RegisterCaptcha.tsx";
import RegisterToken from "@components/login/RegisterToken.tsx";
import Loading from "@components/Loading.tsx";
import {useLocation} from "wouter";
import {LoginFormHistoryState} from "@models/historyState.ts";

export default function Register(): ReactElement {
    const [_, navigate] = useLocation()
    const {
        data: homeSrvServiceStatus,
        isLoading: homeSrvServiceLoading,
        error: homeSrvServiceError
    } = useServiceStatus()

    useEffect(() => {
        if(homeSrvServiceError)
            navigate("/login-form/main", {state: { homeSrvError: true } as LoginFormHistoryState})
    }, [homeSrvServiceError]);

    return (
        <>
            {homeSrvServiceLoading
                ? <Loading/>
                : <>
                    {homeSrvServiceStatus?.reg_pub_allowed
                        ? <RegisterCaptcha/>
                        : <RegisterToken/>
                    }
                  </>
            }
        </>
    )
}