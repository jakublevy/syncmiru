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

export default function RegTknsActiveList(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [regTkns, setRegTkns] = useState<Array<RegTkn>>([])
    const [search, setSearch] = useState<string>('')

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
                        <CopyBtn
                            className="w-8"
                            onClick={() => copyRegTkn(regTkn)}
                        />
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

    async function copyRegTkn(regTkn: RegTkn) {
        await navigator.clipboard.writeText(regTkn.key);
        showTemporalSuccessAlertForModal(`${t('reg-tkns-copy-1')} "${regTkn.name}" ${t('reg-tkns-copy-2')}`)
    }

    return (
        <div className="flex flex-col">
            <SearchInput value={search} setValue={setSearch}/>
            <DataTableThemeAware
                columns={columns}
                data={
                regTkns.filter(item => {
                    if(item.name.includes(search)) {
                        return item
                    }
                    if(item.max_reg == null) {
                        if(search.trim() === "∞")
                            return item
                    }
                    else {
                        if(item.max_reg.toString().includes(search)){
                            return item
                        }
                    }
                })
            }
            />
        </div>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}