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
                    const data = {source_url: source, jwt: jwt}
                    invoke<UserLoadedInfo>('mpv_load_from_source', {data: JSON.stringify(data)})
                        .catch(() => {
                            showPersistentErrorAlert(t('mpv-load-error'))
                            disconnectFromRoom(ctx, t)
                        })
                }
                else if(entry instanceof PlaylistEntryUrl) {
                    const video = entry as PlaylistEntryUrl
                    invoke('mpv_load_from_url', {url: video.url})
                        .catch(() => {
                            showPersistentErrorAlert(t('mpv-load-error'))
                            disconnectFromRoom(ctx, t)
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