import {ReactElement, useEffect} from "react";
import {useLocation} from "wouter";
import {useServiceStatus} from "@hooks/useServiceStatus.ts";
import {ForgottenPasswordHistoryState, LoginFormHistoryState} from "@models/historyState.ts";
import Loading from "@components/Loading.tsx";
import EmailVerify from "@components/login/EmailVerify.tsx";
import {useHistoryState} from "wouter/use-browser-location";
import ForgottenPassword from "@components/login/ForgottenPassword.tsx";

export default function ForgottenPasswordDispatch(): ReactElement {
    const [_, navigate] = useLocation()
    const {email}: ForgottenPasswordHistoryState = useHistoryState()
    const {
        data: homeSrvServiceStatus,
        isLoading: homeSrvServiceLoading,
        error: homeSrvServiceError
    } = useServiceStatus()

    useEffect(() => {
        if(homeSrvServiceError)
            navigate("/login-form/main", {state: { homeSrvError: true, email: email } as LoginFormHistoryState})
    }, [homeSrvServiceError]);

    return (
        <>
            {homeSrvServiceLoading || homeSrvServiceStatus === undefined
                ? <Loading/>
                : <ForgottenPassword email={email} waitBeforeResend={homeSrvServiceStatus.wait_before_resend}/>
            }
        </>
    )
}