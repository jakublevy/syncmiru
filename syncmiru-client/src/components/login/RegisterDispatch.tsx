import {ReactElement, useEffect} from "react";
import {useServiceStatus} from "@hooks/useServiceStatus.ts";
import Register from "@components/login/Register.tsx";
import Loading from "@components/Loading.tsx";
import {useLocation} from "wouter";
import {LoginFormHistoryState} from "@models/historyState.ts";
import {navigateToLoginFormMain} from "../../utils/navigate.ts";

export default function RegisterDispatch(): ReactElement {
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
                : <Register regPubAllowed={homeSrvServiceStatus.reg_pub_allowed}/>
            }
        </>
    )
}