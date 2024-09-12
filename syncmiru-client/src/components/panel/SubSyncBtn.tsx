import React, {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Clickable} from "@components/widgets/Button.tsx";
import SubtitlesCrossed from "@components/svg/SubtitlesCrossed.tsx";
import {useChangeSubSync} from "@hooks/useSubSync.ts";
import SubtitlesSync from "@components/svg/SubtitlesSync.tsx";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {forceDisconnectFromRoom} from "src/utils/room.ts";
import {useTranslation} from "react-i18next";
import {RoomConnectionState} from "@models/context.ts";
import {UserId} from "@models/user.ts";
import {UserAudioSubtitles} from "@models/mpv.ts";

export default function SubSyncBtn(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()
    const changeSubSync = useChangeSubSync()

    const connectedToRoom = ctx.currentRid != null && ctx.roomConnection === RoomConnectionState.Established

    function subSyncToggle() {
        changeSubSync(!ctx.subSync).then(() => {
            ctx.setSubSync(!ctx.subSync)

            ctx.setUid2audioSub((p) => {
                const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
                for(const [id, value] of p) {
                    if(id !== ctx.uid)
                        m.set(id, value)
                }
                const oldValue = p.get(ctx.uid)
                if(oldValue != null) {
                    const {subSync: oldSubSync, ...rest} = oldValue
                    const newValue = {
                        subSync: !ctx.subSync,
                        ...rest
                    } as UserAudioSubtitles;
                    m.set(ctx.uid, newValue)
                }
                return m
            })

            if(connectedToRoom) {
                ctx.socket!.emitWithAck('change_sub_sync', !ctx.subSync)
                    .catch(() => {
                        showPersistentErrorAlert(t('mpv-change-sub-sync-error'))
                        forceDisconnectFromRoom(ctx, t)
                    })
            }
        })
    }

    return (
        <Clickable className="p-2" onClick={subSyncToggle}>
            {ctx.subSync
                ? <SubtitlesSync className="h-7"/>
                : <SubtitlesCrossed className="h-7"/>
            }
        </Clickable>
    )
}