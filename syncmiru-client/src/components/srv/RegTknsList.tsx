import React, {ReactElement, useEffect, useState} from "react";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {WarningBanner} from "@components/widgets/Banner.tsx";
import RegTknCreate from "@components/srv/RegTknCreate.tsx";

export default function RegTknsList(): ReactElement {
    const [_, navigate] = useLocation()
    const {socket} = useMainContext()
    const [loading, setLoading] = useState<boolean>(true)
    const [regPubAllowed, setRegPubAllowed] = useState<boolean>(false)
    const [newRegTknLoading, setNewRegTknLoading] = useState<boolean>(false)

    useEffect(() => {
        if (socket !== undefined) {
            socket.emitWithAck("get_reg_pub_allowed")
                .then((regPubAllowed: boolean) => {
                    setRegPubAllowed(regPubAllowed)
                })
                .finally(() => setLoading(false))
        }
    }, [socket]);

    function showContent() {
        return !loading && !newRegTknLoading
    }

    return (
        <>
            {!showContent() &&
                <div className="flex justify-center items-center h-full">
                    <Loading/>
                </div>
            }
            <div className={`flex flex-col ${showContent() ? '' : 'hidden'}`}>
                <div className="flex items-center m-8">
                    <h1 className="text-2xl font-bold">Registrační tokeny – přehled</h1>
                    <div className="flex-1"></div>
                    <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
                </div>
                {regPubAllowed && <div className="ml-8 mr-8">
                    <WarningBanner
                        title="Veřejné registrace jsou povoleny"
                        content="Registrační tokeny nejsou vyžadovány pro vytvoření uživatelského účtu."
                    />
                </div>}
                <div className="ml-8 mr-8 flex gap-x-4">
                    <RegTknCreate
                        setLoading={(b) => setNewRegTknLoading(b)}
                    />
                </div>
                <div className="flex flex-col ml-8 mr-8 mb-8 mt-4 gap-y-6">
                    <h2 className="text-xl font-semibold">Seznam validních registračních tokenů</h2>
                </div>
                <div className="flex flex-col m-8 gap-y-6">
                    <h2 className="text-xl font-semibold">Seznam využitých registračních tokenů</h2>
                </div>
            </div>
        </>
    )
}