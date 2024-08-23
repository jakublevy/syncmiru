import React, {ReactElement, useEffect, useRef} from "react";
import MpvThumbnail from "@components/svg/MpvThumbnail.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Event, listen, UnlistenFn} from "@tauri-apps/api/event";
import {disconnectFromRoom, forceDisconnectFromRoom} from "src/utils/room.ts";
import {RoomConnectionState} from "@models/context.ts";
import {invoke} from "@tauri-apps/api/core";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {
    PlaylistEntry,
    PlaylistEntryId,
    PlaylistEntrySubtitles,
    PlaylistEntryUrl,
    PlaylistEntryVideo
} from "@models/playlist.ts";

export default function Mpv(p: Props): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()
    const mpvWrapperRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null)
    const connectedToRoom = ctx.currentRid != null && ctx.roomConnection === RoomConnectionState.Established

    useEffect(() => {
        let unlisten: Array<Promise<UnlistenFn>> = []

        unlisten.push(listen<boolean>('mpv-running', (e: Event<boolean>) => {
            if(!e.payload && connectedToRoom) {
                disconnectFromRoom(ctx, t)
            }
            ctx.setMpvRunning(e.payload)
        }))

        unlisten.push(listen<void>('mpv-resize', (e: Event<void>) => {
            if(ctx.mpvRunning && !ctx.mpvWinDetached) {
                if(!ctx.mpvShowSmall)
                    mpvResize()
                else
                    mpvResizeToSmall()
            }
        }))

        unlisten.push(listen<Record<"width" | "height", number>>('tauri://resize', (e) => {
            setTimeout(() => {
                if(ctx.mpvRunning && !ctx.mpvWinDetached) {
                    if(!ctx.mpvShowSmall)
                        mpvResize()
                    else
                        mpvResizeToSmall()
                }
            }, 50)
        }))

        unlisten.push(listen<boolean>('mpv-win-detached-changed', (e: Event<boolean>) => {
            ctx.setMpvWinDetached(e.payload)
        }))

        return () => {
            unlisten.forEach(x => x.then((unsub) => unsub()))
        }
    }, [ctx.currentRid, ctx.roomConnection, ctx.mpvWinDetached, ctx.mpvShowSmall, ctx.mpvRunning]);

    useEffect(() => {
        if(ctx.mpvRunning && !ctx.mpvWinDetached && !ctx.mpvShowSmall)
            mpvResize()
    }, [p.mpvResizeVar, mpvWrapperRef.current, ctx.mpvRunning, ctx.mpvShowSmall, ctx.usersShown]);

    useEffect(() => {
        if(ctx.mpvRunning && !ctx.mpvWinDetached) {
            if (ctx.modalShown || ctx.settingsShown) {
                ctx.setMpvShowSmall(true)
                mpvResizeToSmall()
            } else {
                ctx.setMpvShowSmall(false)
                mpvResize()
            }
        }
    }, [ctx.modalShown, ctx.settingsShown, ctx.mpvRunning, ctx.mpvWinDetached]);

    useEffect(() => {
        if(ctx.activeVideoId == null)
            return

        const id = ctx.activeVideoId as PlaylistEntryId
        //console.log(`active id: ${id}`)
        const jwt = ctx.jwts.get(id) as string
        //console.log(`jwt: ${jwt}`)
        //console.log(ctx.jwts)
        const entry = ctx.playlist.get(id) as PlaylistEntry
        if(entry instanceof PlaylistEntryVideo) {
            const video = entry as PlaylistEntryVideo
            const source = ctx.source2url.get(video.source) as string
            const data = {source_url: source, jwt: jwt}
            invoke('mpv_load_from_source', {data: JSON.stringify(data)})
                .then(() => {
                    //console.log('source loaded')
                })
                .catch(() => {
                    //console.log('source load failed')
                })
            //console.log(`source: ${source}`)
        }
        else if(entry instanceof PlaylistEntryUrl) {
            const url = entry as PlaylistEntryUrl
            //console.log(`url ${url.url}`)
        }
        else {
            const sub = entry as PlaylistEntrySubtitles
            const source = ctx.source2url.get(sub.source) as string
            //console.log(`source: ${source}`)
        }

    }, [ctx.activeVideoId, ctx.jwts, ctx.source2url]);


    function mpvResize() {
        const mpvWrapper = mpvWrapperRef.current as HTMLDivElement
        const rect = mpvWrapper.getBoundingClientRect()

        invoke('mpv_wrapper_size_changed', {wrapperSize: rect})
            .catch(() => {
                showPersistentErrorAlert(t('mpv-resize-error'))
                forceDisconnectFromRoom(ctx, t)
            })
    }

    function mpvResizeToSmall() {
        invoke('mpv_reposition_to_small', {})
            .catch(() => {
                showPersistentErrorAlert(t('mpv-resize-error'))
                forceDisconnectFromRoom(ctx, t)
            })
    }

    return (
        <div
            className={`flex flex-col justify-center items-center h-full gap-y-3 ${ctx.mpvRunning ? 'invisible' : ''}`}
            ref={mpvWrapperRef}
        >
            <MpvThumbnail className="min-w-20 w-20 max-w-20"/>
            <p>{t('mpv-not-connected-to-room-msg')}</p>
        </div>
    )
}

interface Props {
    mpvResizeVar: boolean,
    setMpvResizeVar: (b: boolean) => void
}
