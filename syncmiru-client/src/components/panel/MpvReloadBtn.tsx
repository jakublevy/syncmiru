import {ReactElement} from "react";
import {Clickable} from "@components/widgets/Button.tsx";
import Reload from "@components/svg/Reload.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {PlaylistEntry, PlaylistEntryId, PlaylistEntryUrl, PlaylistEntryVideo} from "@models/playlist.ts";
import {invoke} from "@tauri-apps/api/core";
import {UserLoadedInfo} from "@models/mpv.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {disconnectFromRoom} from "src/utils/room.ts";
import {useTranslation} from "react-i18next";
import {showMpvReadyMessages} from "src/utils/mpv.ts";
import {UserId} from "@models/user.ts";

export default function MpvReloadBtn(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()
    const readyStatus = ctx.uid2ready.get(ctx.uid)

    function mpvReloadClicked() {
        const id = ctx.activeVideoId as PlaylistEntryId
        const entry = ctx.playlist.get(id) as PlaylistEntry
        ctx.socket!.emitWithAck('user_file_load_retry', {})
            .then(() => {
                if(entry instanceof PlaylistEntryVideo) {
                    const jwt = ctx.jwts.get(id) as string
                    const video = entry as PlaylistEntryVideo
                    const source = ctx.source2url.get(video.source) as string
                    const data = {source_url: source, jwt: jwt, playback_speed: ctx.joinedRoomSettings.playback_speed}

                    ctx.setUid2ready((p) => {
                        const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
                        for (const [id, value] of p) {
                            m.set(id, value)
                        }
                        m.set(ctx.uid, UserReadyState.Loading)

                        invoke<UserLoadedInfo>('mpv_load_from_source', {data: JSON.stringify(data)})
                            .then(() => {
                                showMpvReadyMessages(m, ctx.users, t)
                            })
                            .catch(() => {
                                showPersistentErrorAlert(t('mpv-load-error'))
                                disconnectFromRoom(ctx, t)
                            })

                        return m
                    })
                }
                else if(entry instanceof PlaylistEntryUrl) {
                    const video = entry as PlaylistEntryUrl
                    const data = {url: video.url, playback_speed: ctx.joinedRoomSettings.playback_speed}

                    ctx.setUid2ready((p) => {
                        const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
                        for (const [id, value] of p) {
                            m.set(id, value)
                        }
                        m.set(ctx.uid, UserReadyState.Loading)

                        invoke('mpv_load_from_url', {data: JSON.stringify(data)})
                            .then(() => {
                                showMpvReadyMessages(m, ctx.users, t)
                            })
                            .catch(() => {
                                showPersistentErrorAlert(t('mpv-load-error'))
                                disconnectFromRoom(ctx, t)
                            })

                        return m
                    })
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('mpv-file-load-retry-error'))
            })
    }

    if(readyStatus === UserReadyState.Error)
        return (
            <Clickable className="p-2" onClick={mpvReloadClicked}>
                <Reload className="h-7"/>
            </Clickable>
        )
    return <div></div>
}