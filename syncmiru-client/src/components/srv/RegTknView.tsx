import React, {ReactElement, useEffect, useState} from "react";
import {BackBtn, CloseBtn, CopyBtn, DeleteBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import {RegDetail, RegTkn, RegTknType} from "@models/regTkn.ts";
import {copyRegTkn} from "src/utils/regTkn.ts";
import Loading from "@components/Loading.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {ModalDelete} from "@components/widgets/Modal.tsx";
import RegTknUsedTable from "@components/srv/RegTknUsedTable.tsx";

export default function RegTknView(p: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const {socket, users} = useMainContext()
    const [loading, setLoading] = useState<boolean>(true)
    const [regDetails, setRegDetails] = useState<Array<RegDetail>>([])
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)

    useEffect(() => {
        if (socket !== undefined) {
            socket.emitWithAck("get_reg_tkn_info", {id: p.regTkn.id})
                .then((ack: SocketIoAck<Array<RegDetail>>) => {
                    if (ack.status === SocketIoAckType.Err) {
                        showPersistentErrorAlert("Došlo k chybě při získávání detailů registračního tokenu")
                        p.backClicked()
                    } else {
                        setRegDetails((ack.payload as Array<RegDetail>).map(r => {
                            return {uid: r.uid, reg_at: new Date(r.reg_at)}
                        }))
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert("Došlo k chybě při získávání detailů registračního tokenu")
                    p.backClicked()
                })
                .finally(() => setLoading(false))
        }
    }, [socket, users]);

    function deleteRegTkn() {
        setShowDeleteDialog(true)
    }

    function regTknDeleteConfirmed() {
        setLoading(true)
        socket!.emitWithAck("delete_reg_tkn", {id: p.regTkn.id})
            .then((ack: SocketIoAck<null>) => {
                if (ack.status === SocketIoAckType.Ok) {
                    p.backClicked()
                } else {
                    showPersistentErrorAlert(t('reg-tkn-delete-error'))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('reg-tkn-delete-error'))
            })
            .finally(() => setLoading(false))
    }

    if (loading)
        return (
            <div className="flex justify-center items-center h-full">
                <Loading/>
            </div>
        )

    return (
        <>
            <div className="flex flex-col">
                <div className="flex items-center m-8">
                    <BackBtn onClick={p.backClicked} className="mr-4"/>
                    <h1 className="text-2xl font-bold">{t('reg-tkn-view-title')}</h1>
                    <div className="flex-1"></div>
                    <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
                </div>
                <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                    <div className="flex items-center">
                        <p className="w-52">{t('reg-tkn-name-header')}</p>
                        <p className="font-bold">{p.regTkn.name}</p>
                    </div>
                </div>
                <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                    <div className="flex items-center">
                        <p className="w-52">{t('reg-tkn-view-max-regs')}</p>
                        <p className="font-bold">{p.regTkn.max_reg == null ? '∞' : p.regTkn.max_reg}</p>
                    </div>
                </div>
                <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                    <div className="flex items-center">
                        <p className="w-52">{t('reg-tkn-view-used')}</p>
                        <p className="font-bold">{p.regTkn.used}</p>
                    </div>
                </div>
                <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                    <div className="flex items-center">
                        <p className="w-52">Token</p>
                        <p className="font-bold">{p.regTkn.key}</p>
                        <div className="flex-1"></div>
                        {p.regTknType === RegTknType.Active && <CopyBtn
                            className="w-10"
                            onClick={() => copyRegTkn(p.regTkn, t)}
                        />}
                    </div>
                </div>
                <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                    <div className="flex items-center">
                        <p className="w-52">{t('reg-tkn-view-delete-tkn')}</p>
                        <div className="flex-1"></div>
                        <DeleteBtn
                            className="w-10"
                            onClick={deleteRegTkn}
                        />
                    </div>
                </div>
                <div className="flex flex-col ml-8 mr-8 mb-8 mt-4 gap-y-4">
                    <h2 className="text-xl font-semibold">{t('reg-tkn-view-details-title')}</h2>
                    <RegTknUsedTable
                        regDetails={regDetails}
                    />
                </div>
            </div>
            <ModalDelete
                onDeleteConfirmed={regTknDeleteConfirmed}
                content={
                    <p>{t('modal-reg-tkn-delete-text')} "{p.regTkn.name}"?</p>
                }
                open={showDeleteDialog}
                setOpen={setShowDeleteDialog}
            />
        </>
    )
}

interface Props {
    regTkn: RegTkn
    regTknType: RegTknType
    backClicked: () => void
}