import {ReactElement, useEffect} from "react";
import {useLocation} from "wouter";
import {useServiceStatus} from "@hooks/useServiceStatus.ts";
import Loading from "@components/Loading.tsx";
import EmailVerify from "@components/login/EmailVerify.tsx";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";

export default function EmailVerifyDispatch(): ReactElement {
    const [_, navigate] = useLocation()
    const {
        data: homeSrvServiceStatus,
        isLoading: homeSrvServiceLoading,
        error: homeSrvServiceError
    } = useServiceStatus()

    useEffect(() => {
        if(homeSrvServiceError)
            navigateToLoginFormMain(navigate, {homeSrvError: true})

    }, [homeSrvServiceError]);

    return (
        <>
            {homeSrvServiceLoading || homeSrvServiceStatus === undefined
                ? <Loading/>
                : <EmailVerify waitBeforeResend={homeSrvServiceStatus.wait_before_resend}/>
            }
        </>
    )
}