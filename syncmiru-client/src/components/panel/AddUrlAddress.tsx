import React, {ReactElement} from "react";
import Link from "@components/svg/Link.tsx";
import {MenuItem} from "@szhsin/react-menu";
import {useTranslation} from "react-i18next";

export default function AddUrlAddress(): ReactElement {
    const {t} = useTranslation()

    return (
        <>
            <MenuItem className="w-[13rem]">
                <div className="flex gap-x-3">
                    <Link className="h-6 w-6"/>
                    <p>{t('add-to-playlist-url')}</p>
                </div>
            </MenuItem>
        </>
    )
}