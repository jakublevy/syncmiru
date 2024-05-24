import React, {ReactElement, useEffect, useState} from "react";
import {BackBtn, CloseBtn, CopyBtn, DeleteBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import {RegDetail, RegTkn, RegTknType} from "@models/srv.ts";
import {copyRegTkn} from "src/utils/regTkn.ts";
import Loading from "@components/Loading.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function RegTknView(p: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const {socket, users} = useMainContext()
    const [loading, setLoading] = useState<boolean>(true)
    const [regDetails, setRegDetails] = useState<Array<RegDetail>>([])

    useEffect(() => {
        if (socket !== undefined) {
            socket.emitWithAck("get_reg_tkn_info", {id: p.regTkn.id})
                .then((ack: SocketIoAck<Array<RegDetail>>) => {
                    if (ack.status === SocketIoAckType.Err) {
                        showPersistentErrorAlert("")
                        p.backClicked()
                    }
                    else {
                        setRegDetails(ack.payload as Array<RegDetail>)
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert("")
                    p.backClicked()
                })
                .finally(() => setLoading(false))
        }
    }, [socket]);

    useEffect(() => {
        if(socket !== undefined) {
            // TODO: prepare for datatable
        }
    }, [socket, regDetails]);

    function deleteRegTkn() {
        // TODO:
    }

    if (loading)
        return (
            <div className="flex justify-center items-center h-full">
                <Loading/>
            </div>
        )

    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <BackBtn onClick={p.backClicked} className="mr-4"/>
                <h1 className="text-2xl font-bold">Detail registračního tokenu</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                <div className="flex items-center">
                    <p className="w-52">Název</p>
                    <p className="font-bold">{p.regTkn.name}</p>
                </div>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                <div className="flex items-center">
                    <p className="w-52">Max počet registrací</p>
                    <p className="font-bold">{p.regTkn.max_reg == null ? '∞' : p.regTkn.max_reg}</p>
                </div>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                <div className="flex items-center">
                    <p className="w-52">Počet využití</p>
                    <p className="font-bold">{regDetails.length}</p>
                </div>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                <div className="flex items-center">
                    <p className="w-52">Token</p>
                    <p className="font-bold">{p.regTkn.key}</p>
                    <div className="flex-1"></div>
                    <CopyBtn
                        className="w-10"
                        onClick={() => copyRegTkn(p.regTkn, t)}
                    />
                </div>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                <div className="flex items-center">
                    <p className="w-52">Smazat registrační token</p>
                    <div className="flex-1"></div>
                    <DeleteBtn
                        className="w-10"
                    />
                </div>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 mt-4 gap-y-4">
                <h2 className="text-xl font-semibold">Využito k registraci osob</h2>
            </div>
        </div>
    )
}

interface Props {
    regTkn: RegTkn
    regTknType: RegTknType
    backClicked: () => void
}