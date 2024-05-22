import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {ReactElement, useEffect, useState} from "react";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {RegTkn} from "@models/srv.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {TableColumn} from "react-data-table-component";
import {CopyBtn, DeleteBtn, ViewBtn} from "@components/widgets/Button.tsx";
import 'src/utils/datatable-themes.ts'
import DataTableThemeAware from "@components/widgets/DataTableThemeAware.tsx";

export default function RegTknsActiveList(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [regTkns, setRegTkns] = useState<Array<RegTkn>>([])

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
            cell: (reg_tkn) => {
                return (
                    <div className="flex gap-x-2">
                        <CopyBtn className="w-8"/>
                        <ViewBtn className="w-8"/>
                        <DeleteBtn className="w-8"/>
                    </div>
                )
            }
        }
    ]

    useEffect(() => {
        if (socket !== undefined) {
            socket.on("active_reg_tkns", onActiveRegTkns)

            socket.emitWithAck("active_reg_tkns")
                .then((ack: SocketIoAck<Array<RegTkn>>) => {
                    if (ack.status === SocketIoAckType.Err)
                        showPersistentErrorAlert(t('modal-active-reg-tkn-fetch-error'))
                    else
                        setRegTkns(ack.payload as Array<RegTkn>)

                    console.log(JSON.stringify(ack.payload))
                })
                .catch(() => {
                    showPersistentErrorAlert(t('modal-active-reg-tkn-fetch-error'))
                })
                .finally(() => {
                    p.setLoading(false)
                })
        }
    }, [socket]);

    function onActiveRegTkns(regTkns: Array<RegTkn>) {
        // TODO: implement
    }

    return (
        <DataTableThemeAware
            columns={columns}
            data={regTkns}
        />
    )
}

interface Props {
    setLoading: (b: boolean) => void
}