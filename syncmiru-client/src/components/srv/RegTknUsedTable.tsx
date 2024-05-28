import {ReactElement, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useTranslation} from "react-i18next";
import {RegDetail} from "@models/srv.ts";
import {TableColumn} from "react-data-table-component";
import DateTimeLocalPretty from "@components/widgets/DateTimeLocalPretty.tsx";
import {SearchInput} from "@components/widgets/Input.tsx";
import DataTableThemeAware from "@components/widgets/DataTableThemeAware.tsx";
import Avatar from "@components/widgets/Avatar.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";
import {Language} from "@models/config.tsx";

export default function RegTknUsedTable(p: Props): ReactElement {
    const {t} = useTranslation()
    const lang = useLanguage()
    const {users} = useMainContext()
    const [search, setSearch] = useState<string>('')

    const columns: TableColumn<TableUser>[] = [
        {
            name: '',
            cell: (user) => {
               return <Avatar className="w-16 p-2" picBase64={user.avatar}/>
            }
        },
        {
            name: t('displayname-label'),
            selector: row => row.displayname,
            sortable: true
        },
        {
            name: t('username-label'),
            selector: row => row.username,
            sortable: true
        },
        {
            id: 'reg_at',
            name: t('reg-at-label'),
            cell: (user) => {
                return <DateTimeLocalPretty datetime={user.reg_at}/>
            },
            sortable: true
        }
    ]

    function transformToTableData(): Array<TableUser> {
        const tableData: Array<TableUser> = new Array<TableUser>()
        for(const regDetail of p.regDetails) {
            const user = users.get(regDetail.uid)
            if(user === undefined)
                continue

            tableData.push({
                uid: regDetail.uid,
                username: user.username,
                displayname: user.displayname,
                avatar: user.avatar,
                reg_at: regDetail.reg_at
            })
        }
        return tableData
    }

    return (
        <div className="flex flex-col">
            <SearchInput value={search} setValue={setSearch}/>
            <DataTableThemeAware
                defaultSortFieldId="reg_at"
                columns={columns}
                data={
                transformToTableData()
                    .filter(item => {
                        const s = search.toLowerCase()
                        let datePretty = item.reg_at.toLocaleString("en-US")
                        if(lang === Language.Czech)
                            datePretty = item.reg_at.toLocaleString("cs-CZ")

                        if (item.displayname.toLowerCase().includes(s))
                            return item
                        if(item.username.toLowerCase().includes(s))
                            return item
                        if(datePretty.toLowerCase().includes(s))
                            return item
                    })
            }
            />
        </div>
    )
}

interface Props {
    regDetails: Array<RegDetail>
}

interface TableUser {
    uid: number
    avatar: string,
    username: string,
    displayname: string,
    reg_at: Date
}