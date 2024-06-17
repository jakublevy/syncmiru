import React, {ReactElement} from "react";
import Server from "@components/svg/Server.tsx";
import {MenuItem} from "@szhsin/react-menu";
import {useTranslation} from "react-i18next";

export default function AddFromFileSrv(): ReactElement {
    const {t} = useTranslation()

    return (
        <>
            <MenuItem className="w-[13rem]">
                <div className="flex gap-x-3">
                    <Server className="h-6 w-6"/>
                    <p>{t('add-to-playlist-file-server')}</p>
                </div>
            </MenuItem>
        </>
    )
}