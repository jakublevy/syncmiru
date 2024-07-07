import React, {ReactElement} from "react";
import MpvThumbnail from "@components/svg/MpvThumbnail.tsx";
import {useTranslation} from "react-i18next";

export default function Mpv(): ReactElement {
    const {t} = useTranslation()
    return (
        <div className="flex flex-col justify-center items-center h-full gap-y-3">
            <MpvThumbnail className="min-w-20 w-20 max-w-20"/>
            <p>{t('mpv-not-connected-to-room-msg')}</p>
        </div>
    )
}
