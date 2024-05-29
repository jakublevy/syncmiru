import React, {ReactElement, useEffect, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {RegTkn, RegTknType} from "@models/srv.ts";
import RegTknView from "@components/srv/RegTknView.tsx";
import RegTknsList from "@components/srv/RegTknsList.tsx";

export default function RegTkns(): ReactElement {
    const {socket} = useMainContext()
    const [regPubFetching, setRegPubFetching] = useState<boolean>(true)
    const [regPubAllowed, setRegPubAllowed] = useState<boolean>(false)
    const [regTknForDetail, setRegTknForDetail] = useState<RegTkn>()
    const [regTknType, setRegTknType] = useState<RegTknType>()

    useEffect(() => {
        if (socket !== undefined) {
            socket.emitWithAck("get_reg_pub_allowed")
                .then((regPubAllowed: boolean) => {
                    setRegPubAllowed(regPubAllowed)
                })
                .finally(() => setRegPubFetching(false))
        }
    }, [socket]);


    function showContent() {
        return !regPubFetching
    }

    function showListContent() {
        return showContent() && regTknForDetail === undefined
    }

    function showDetailContent() {
        return showContent() && regTknForDetail !== undefined && regTknType !== undefined
    }

    function viewDetail(regTkn: RegTkn, regTknType: RegTknType) {
        setRegTknType(regTknType)
        setRegTknForDetail(regTkn)
    }

    function backFromDetail() {
        setRegTknType(undefined)
        setRegTknForDetail(undefined)
    }

    return (
        <>
            {!showContent() &&
                <div className="flex justify-center items-center h-full">
                    <Loading/>
                </div>
            }
            {showListContent() && <RegTknsList
                regPubAllowed={regPubAllowed}
                viewDetail={viewDetail}
            />}
            {showDetailContent() && <RegTknView
                regTkn={regTknForDetail as RegTkn}
                regTknType={regTknType as RegTknType}
                backClicked={backFromDetail}
            />
            }
        </>
    )
}