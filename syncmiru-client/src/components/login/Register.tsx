import {ReactElement, useEffect} from "react";
import {useServiceStatus} from "@hooks/useServiceStatus.ts";
import RegisterCaptcha from "@components/login/RegisterCaptcha.tsx";
import RegisterToken from "@components/login/RegisterToken.tsx";
import Loading from "@components/Loading.tsx";

export default function Register(): ReactElement {
    const {
        data: homeSrvServiceStatus,
        isLoading: homeSrvServiceLoading,
        error: homeSrvServiceError
    } = useServiceStatus()

    useEffect(() => {
        if(homeSrvServiceError) {
            console.log('error, do something')
            return;
        }

    }, [homeSrvServiceError]);

    return (
        <>
            {homeSrvServiceLoading
                ? <Loading/>
                : <>
                    {homeSrvServiceStatus?.reg_public_allowed
                        ? <RegisterCaptcha/>
                        : <RegisterToken/>
                    }
                  </>

            }
        </>
    )
}