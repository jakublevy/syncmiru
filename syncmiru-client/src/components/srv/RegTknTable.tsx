import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {ReactElement, useEffect, useState} from "react";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {RegTkn} from "@models/srv.ts";
import {showPersistentErrorAlert, showTemporalSuccessAlertForModal} from "src/utils/alert.ts";
import {TableColumn} from "react-data-table-component";
import {CopyBtn, DeleteBtn, ViewBtn} from "@components/widgets/Button.tsx";
import 'src/utils/datatable-themes.ts'
import DataTableThemeAware from "@components/widgets/DataTableThemeAware.tsx";
import {SearchInput} from "@components/widgets/Input.tsx";
import {ModalDelete} from "@components/widgets/Modal.tsx";

export default function RegTknsTable(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [regTkns, setRegTkns] = useState<Array<RegTkn>>([])
    const [search, setSearch] = useState<string>('')
    const [deletingRegTkn, setDeletingRegTkn] = useState<RegTkn>({id: 0, max_reg: 0, key: '', name: ''})
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
                            onClick={() => copyRegTkn(regTkn)}
                        />}
                        <ViewBtn className="w-8"/>
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
                socket.emitWithAck("active_reg_tkns")
                    .then((ack: SocketIoAck<Array<RegTkn>>) => {
                        if (ack.status === SocketIoAckType.Err)
                            showPersistentErrorAlert(t('modal-active-reg-tkn-fetch-error'))
                        else
                            setRegTkns(ack.payload as Array<RegTkn>)
                    })
                    .catch(() => {
                        showPersistentErrorAlert(t('modal-active-reg-tkn-fetch-error'))
                    })
                    .finally(() => {
                        p.setLoading(false)
                    })
            } else {
                socket.on("inactive_reg_tkns", onRegTkns)
                socket.emitWithAck("inactive_reg_tkns")
                    .then((ack: SocketIoAck<Array<RegTkn>>) => {
                        if (ack.status === SocketIoAckType.Err)
                            showPersistentErrorAlert(t('modal-inactive-reg-tkn-fetch-error'))

                        else
                            setRegTkns(ack.payload as Array<RegTkn>)
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

    function onRegTkns(regTkns: Array<RegTkn>) {
        // TODO: implement
    }

    async function copyRegTkn(regTkn: RegTkn) {
        await navigator.clipboard.writeText(regTkn.key);
        showTemporalSuccessAlertForModal(`${t('reg-tkns-copy-1')} "${regTkn.name}" ${t('reg-tkns-copy-2')}`)
    }

    function deleteRegTkn(regTkn: RegTkn) {
        setDeletingRegTkn(regTkn)
        setShowDeleteDialog(true)
    }

    function regTknDeleteConfirmed() {
        p.setLoading(true)
        socket!.emitWithAck("delete_reg_tkn", {id: deletingRegTkn.id})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Ok) {
                    const filtered = regTkns.filter(x => x.id !== deletingRegTkn.id)
                    setRegTkns(filtered)
                }
                else {
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
                        regTkns.filter(item => {
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
                    <p>{t('modal-reg-tkn-delete-text')} "{deletingRegTkn.name}"?</p>
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
}

export enum RegTknType {
    Active,
    Inactive
}