import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {ReactElement, useEffect, useState} from "react";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {RegTkn, RegTknId, RegTknType, RegTknValue} from "@models/srv.ts";
import {showPersistentErrorAlert, showTemporalSuccessAlertForModal} from "src/utils/alert.ts";
import {TableColumn} from "react-data-table-component";
import {CopyBtn, DeleteBtn, ViewBtn} from "@components/widgets/Button.tsx";
import 'src/utils/datatable-themes.ts'
import DataTableThemeAware from "@components/widgets/DataTableThemeAware.tsx";
import {SearchInput} from "@components/widgets/Input.tsx";
import {ModalDelete} from "@components/widgets/Modal.tsx";
import {copyRegTkn} from "../../utils/regTkn.ts";

export default function RegTknsTable(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [regTkns, setRegTkns]
        = useState<Map<RegTknId, RegTknValue>>(new Map<RegTknId, RegTknValue>())
    const [search, setSearch] = useState<string>('')
    const [deletingRegTknId, setDeletingRegTknId] = useState<RegTknId>(0)
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)

    const columns: TableColumn<RegTkn>[] = [
        {
            name: t('reg-tkn-name-header'),
            selector: row => row.name,
            sortable: true
        },
        {
            name: t('reg-tkn-max-regs-header'),
            selector: row => {
                if (row.max_reg == null)
                    return '∞'
                return row.max_reg
            },
            sortFunction: (a, b) => {
                if (a.max_reg == null) {
                    if (b.max_reg == null) {
                        return 0
                    } else {
                        return 1
                    }
                } else {
                    if (b.max_reg == null) {
                        return -1
                    } else {
                        return 0
                    }
                }
            },
            sortable: true
        },
        {
            name: '',
            cell: (regTkn) => {
                return (
                    <div className="flex gap-x-2">
                        {p.regTknType === RegTknType.Active && <CopyBtn
                            className="w-8"
                            onClick={() => copyRegTkn(regTkn, t)}
                        />}
                        <ViewBtn
                            className="w-8"
                            onClick={() => p.viewDetail(regTkn)}
                        />
                        <DeleteBtn
                            onClick={() => deleteRegTkn(regTkn)}
                            className="w-8"
                        />
                    </div>
                )
            }
        }
    ]

    useEffect(() => {
        if (socket !== undefined) {
            if (p.regTknType === RegTknType.Active) {
                socket.on("active_reg_tkns", onRegTkns)
                socket.on("del_active_reg_tkns", onDeleteRegTkns)
                socket.emitWithAck("active_reg_tkns")
                    .then((ack: SocketIoAck<Array<RegTkn>>) => {
                        if (ack.status === SocketIoAckType.Err)
                            showPersistentErrorAlert(t('modal-active-reg-tkn-fetch-error'))
                        else {
                            const m: Map<RegTknId, RegTknValue> = new Map<RegTknId, RegTknValue>()
                            for (const regTkn of ack.payload as Array<RegTkn>) {
                                m.set(regTkn.id,
                                    {
                                        max_reg: regTkn.max_reg,
                                        name: regTkn.name,
                                        key: regTkn.key
                                    } as RegTknValue)
                            }
                            setRegTkns(m)
                        }
                    })
                    .catch(() => {
                        showPersistentErrorAlert(t('modal-active-reg-tkn-fetch-error'))
                    })
                    .finally(() => {
                        p.setLoading(false)
                    })
            } else {
                socket.emitWithAck("inactive_reg_tkns")
                    .then((ack: SocketIoAck<Array<RegTkn>>) => {
                        socket.on("inactive_reg_tkns", onRegTkns)
                        socket.on("del_inactive_reg_tkns", onDeleteRegTkns)
                        if (ack.status === SocketIoAckType.Err)
                            showPersistentErrorAlert(t('modal-inactive-reg-tkn-fetch-error'))

                        else {
                            const m: Map<RegTknId, RegTknValue> = new Map<RegTknId, RegTknValue>()
                            for (const regTkn of ack.payload as Array<RegTkn>) {
                                m.set(regTkn.id,
                                    {
                                        max_reg: regTkn.max_reg,
                                        name: regTkn.name,
                                        key: regTkn.key
                                    } as RegTknValue)
                            }
                            setRegTkns(m)
                        }
                    })
                    .catch(() => {
                        showPersistentErrorAlert(t('modal-inactive-reg-tkn-fetch-error'))
                    })
                    .finally(() => {
                        p.setLoading(false)
                    })
            }
        }
    }, [socket]);

    useEffect(() => {
        if(socket !== undefined) {
            if (p.regTknType === RegTknType.Active) {
                socket.on("del_active_reg_tkns", onDeleteRegTkns)
            }
            else {
                socket.on("del_inactive_reg_tkns", onDeleteRegTkns)
            }
        }
    }, [deletingRegTknId]);

    function onRegTkns(regTkns: Array<RegTkn>) {
        const m: Map<RegTknId, RegTknValue> = new Map<RegTknId, RegTknValue>()
        for (const regTkn of regTkns) {
            m.set(regTkn.id,
                {
                    max_reg: regTkn.max_reg,
                    name: regTkn.name,
                    key: regTkn.key
                } as RegTknValue)
        }
        setRegTkns((p) => new Map<RegTknId, RegTknValue>([...p, ...m]))
    }

    function onDeleteRegTkns(delRegTknIds: Array<RegTknId>) {
        if(delRegTknIds.includes(deletingRegTknId))
            setShowDeleteDialog(false)

        setRegTkns((regTkns) => {
            const m: Map<RegTknId, RegTknValue> = new Map<RegTknId, RegTknValue>()
            for (const [id, val] of regTkns) {
                if(!delRegTknIds.includes(id))
                    m.set(id,
                        {
                            max_reg: val.max_reg,
                            name: val.name,
                            key: val.key
                        } as RegTknValue)
            }
            return m
        })
    }

function deleteRegTkn(regTkn: RegTkn) {
    setDeletingRegTknId(regTkn.id)
    setShowDeleteDialog(true)
}

function regTknDeleteConfirmed() {
    p.setLoading(true)
    socket!.emitWithAck("delete_reg_tkn", {id: deletingRegTknId})
        .then((ack: SocketIoAck<null>) => {
            if (ack.status === SocketIoAckType.Ok) {
                let m: Map<RegTknId, RegTknValue> = new Map<RegTknId, RegTknValue>();
                setRegTkns((regTkns) => {
                    for (const [id, val] of regTkns) {
                        if(id !== deletingRegTknId)
                            m.set(id, val)
                    }
                    return m
                })
            } else {
                showPersistentErrorAlert(t('reg-tkn-delete-error'))
            }
        })
        .catch(() => {
            showPersistentErrorAlert(t('reg-tkn-delete-error'))
        })
        .finally(() => p.setLoading(false))
}

return (
    <>
        <div className="flex flex-col">
            <SearchInput value={search} setValue={setSearch}/>
            <DataTableThemeAware
                columns={columns}
                data={
                    Array.from(regTkns, ([k, v]) => {
                        return {id: k, key: v.key, name: v.name, max_reg: v.max_reg} as RegTkn
                    }).filter(item => {
                        if (item.name.includes(search)) {
                            return item
                        }
                        if (item.max_reg == null) {
                            if (search.trim() === "∞")
                                return item
                        } else {
                            if (item.max_reg.toString().includes(search)) {
                                return item
                            }
                        }
                    })
                }
            />
        </div>
        <ModalDelete
            onDeleteConfirmed={regTknDeleteConfirmed}
            content={
             <p>{t('modal-reg-tkn-delete-text')} "{regTkns.get(deletingRegTknId)?.name}"?</p>
            }
            open={showDeleteDialog}
            setOpen={setShowDeleteDialog}
        />
    </>
)
}

interface Props {
    setLoading: (b: boolean) => void
    regTknType: RegTknType
    viewDetail: (regTkn: RegTkn) => void
}
