import {ReactElement} from "react";
import VSelect from "@components/svg/VSelect.tsx";
import {Menu, MenuButton, MenuItem} from "@szhsin/react-menu";
import "src/react-menu.css";
import Wrench from "@components/svg/Wrench.tsx";
import Play from "@components/svg/Play.tsx";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";

export default function SrvInfo({homeSrv}: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()

    function srvSettingsClicked() {
        navigate('/main/srv-settings/reg-tkns')
    }

    return (
        <Menu
            gap={8}
            align='center'
            menuButton={
            <MenuButton className="hover:bg-gray-100 dark:hover:bg-gray-700 border h-12">
                <div className="flex items-center justify-between h-12 break-words">
                    <p className="text-sm max-w-[13.2rem] p-1">{homeSrv}</p>
                    <VSelect className="w-4 mr-2"/>
                </div>
            </MenuButton>
        }>
            <MenuItem onClick={srvSettingsClicked} className="w-[14rem]">
                <div className="flex gap-x-3">
                    <Wrench className="h-6 w-6"/>
                    <p>{t('srv-info-settings')}</p>
                </div>
            </MenuItem>
            <MenuItem>
                <div className="flex gap-x-3">
                    <Play className="h-6 w-6"/>
                    <p>{t('srv-info-create-room')}</p>
                </div>
            </MenuItem>
        </Menu>
    )
}

interface Props {
    homeSrv: string
}