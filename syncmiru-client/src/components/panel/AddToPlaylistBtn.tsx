import React, {ReactElement} from "react";
import {Clickable} from "@components/widgets/Button.tsx";
import Plus from "@components/svg/Plus.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {RoomConnectionState} from "@models/context.ts";
import {Tooltip} from "react-tooltip";
import {useTranslation} from "react-i18next";
import {Menu, MenuButton} from "@szhsin/react-menu";
import AddFromFileSrv from "@components/panel/AddFromFileSrv.tsx";
import AddUrlAddress from "@components/panel/AddUrlAddress.tsx";

export default function AddToPlaylistBtn(): ReactElement {
    const {t} = useTranslation()
    const {currentRid, roomConnection} = useMainContext()
    const connectedToRoom = currentRid != null && roomConnection === RoomConnectionState.Established

    if (!connectedToRoom) {
        return (
            <div>
                <a data-tooltip-id="add-to-playlist-btn" data-tooltip-html={t('add-to-playlist-disabled-tooltip')}>
                    <Clickable
                        className="p-2 ml-1"
                        disabled
                    >
                        <Plus className="h-7"/>
                    </Clickable>
                </a>
                <Tooltip
                    id="add-to-playlist-btn"
                    place="bottom"
                    openEvents={{mousedown: true, mouseenter: true}}
                    style={{color: "#eeeeee", backgroundColor: "#4338ca"}}/>
            </div>
        )
    }
    return (
        <Menu
            gap={8}
            align='start'
            menuButton={
                <MenuButton className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 ml-1">
                    <Plus className="h-7"/>
                </MenuButton>
            }>
            <div className="flex flex-col">
                <p className="mx-6 text-sm font-semibold">{t('add-to-playlist-source')}</p>
                <hr className="my-2"/>
                <AddFromFileSrv/>
                <AddUrlAddress/>
            </div>
        </Menu>
    )
}