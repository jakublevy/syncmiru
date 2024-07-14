import React, {ReactElement, useEffect} from "react";
import MpvThumbnail from "@components/svg/MpvThumbnail.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Event, listen} from "@tauri-apps/api/event";
import {disconnectFromRoom} from "src/utils/room.ts";
import {RoomConnectionState} from "@models/context.ts";

export default function Mpv(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()
    const connectedToRoom = ctx.currentRid != null && ctx.roomConnection === RoomConnectionState.Established

    useEffect(() => {
        const unlisten = listen<boolean>('mpv-running', (e: Event<boolean>) => {
            console.log('mpv-running called')
            if(!e.payload && connectedToRoom) {
                disconnectFromRoom(ctx, t)
            }
            ctx.setMpvRunning(e.payload)
        })
        return () => {
            unlisten.then((unsub) => unsub())
        }
    }, [ctx.currentRid, ctx.roomConnection]);

    if(!ctx.mpvRunning)
        return (
            <div className="flex flex-col justify-center items-center h-full gap-y-3">
                <MpvThumbnail className="min-w-20 w-20 max-w-20"/>
                <p>{t('mpv-not-connected-to-room-msg')}</p>
            </div>
        )
    return <></>
}
