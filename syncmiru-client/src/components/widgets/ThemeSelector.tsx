import {MouseEvent, ReactElement, useState} from "react";
import LightMode from "@components/svg/LightMode.tsx";
import DarkMode from "@components/svg/DarkMode.tsx";
import Sync from "@components/svg/Sync.tsx";
import {Btn} from "@components/widgets/Button.tsx";
import Check from "@components/svg/Check.tsx";
import {Theme} from "@models/config.tsx";
import {useChangeTheme, useTheme} from "@hooks/useTheme.ts";
import {useTargetFamily} from "@hooks/useTargetFamily.ts";
import {StatusAlertService} from "react-status-alert";
import {useTranslation} from "react-i18next";

export default function ThemeSelector(): ReactElement {
    const initialTheme = useTheme()
    const changeTheme = useChangeTheme()
    const {t} = useTranslation()
    const targetFamily = useTargetFamily()
    const [theme, setTheme] = useState<Theme>(initialTheme)

    function themeChange(e: MouseEvent<HTMLButtonElement>) {
        const newTheme = e.currentTarget.id as Theme
        changeTheme(newTheme)
            .then(() => {
                setTheme(newTheme)
                if(targetFamily === 'windows') {
                    StatusAlertService.showWarning(
                        t('theme-changed-windows-warning'),
                        {autoHideTime: 3000}
                    )
                }
            })
    }

    return (
        <div className="flex items-center">
            <div className="relative">
                <Btn id={Theme.Light}
                     className={`rounded-full h-min ${theme === Theme.Light ? '-m-1 border-4 border-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                     disabled={theme === Theme.Light}
                     onClick={themeChange}>
                    <LightMode className="w-10 m-4"/>
                </Btn>
                {theme === Theme.Light &&
                    <Check fill="#fff" className="rounded-full bg-primary p-1 w-6 absolute -right-1.5 top-0"/>}
            </div>
            <div className="w-4"></div>
            <div className="relative">
                <Btn
                    id={Theme.Dark}
                    className={`rounded-full h-min ${theme === Theme.Dark ? '-m-1 border-4 border-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    disabled={theme === Theme.Dark}
                    onClick={themeChange}>
                    <DarkMode className="w-10 m-4"/>
                </Btn>
                {theme === Theme.Dark &&
                    <Check fill="#fff" className="rounded-full bg-primary p-1 w-6 absolute -right-1.5 top-0"/>}
            </div>
            <div className="w-4"></div>
            <div className="relative">
                <Btn id={Theme.System}
                     className={`rounded-full h-min ${theme === Theme.System ? '-m-1 border-4 border-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                     disabled={theme === Theme.System}
                     onClick={themeChange}>
                    <Sync className="w-10 m-4"/>
                </Btn>
                {theme === Theme.System &&
                    <Check fill="#fff" className="rounded-full bg-primary p-1 w-6 absolute -right-1.5 top-0"/>}
            </div>
        </div>
    )
}
