import {ReactElement, useEffect, useState} from "react";
import {TableProps} from "react-data-table-component/dist/DataTable/types";
import DataTable from "react-data-table-component";
import useCSSTheme, {CSSTheme} from "@hooks/useCSSTheme.ts";
import {listen} from "@tauri-apps/api/event";
import {useTranslation} from "react-i18next";

export default function DataTableThemeAware<T>(p: Props<T>): ReactElement {
    const {t} = useTranslation()
    const shownTheme: CSSTheme = useCSSTheme()
    const [theme, setTheme] = useState<CSSTheme>(CSSTheme.Light)

    useEffect(() => {
        setTheme(shownTheme)
    }, [shownTheme]);

    useEffect(() => {
        listen<string>('tauri://theme-changed', (e) => {
            if(e.payload === CSSTheme.Light)
                setTheme(CSSTheme.Light)
            else
                setTheme(CSSTheme.Dark)

        })
    }, []);

    return (
        <DataTable
            key={`dt_${theme}`}
            {...p}
            theme={`${theme === CSSTheme.Light ? 'default' : 'mydark'}`}

            noDataComponent={
                <div className="p-6">
                    {t('datatable-no-data')}
                </div>
            }
        />
    )
}

interface Props<T> extends Omit<TableProps<T>, "theme" | "noDataComponent"> {

}