import {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Clickable} from "@components/widgets/Button.tsx";
import Bubble from "@components/svg/Bubble.tsx";
import BubbleCrossed from "@components/svg/BubbleCrossed.tsx";
import {useChangeAudioSync} from "@hooks/useAudioSync.ts";
import {RoomConnectionState} from "@models/context.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {forceDisconnectFromRoom} from "src/utils/room.ts";
import {useTranslation} from "react-i18next";
import {UserId} from "@models/user.ts";
import {UserAudioSubtitles} from "@models/mpv.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";

export default function AudioSyncBtn(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()
    const changeAudioSync = useChangeAudioSync()

    const connectedToRoom = ctx.currentRid != null && ctx.roomConnection === RoomConnectionState.Established

    function audioSyncToggle() {
        changeAudioSync(!ctx.audioSync).then(() => {
            ctx.setAudioSync(!ctx.audioSync)

            ctx.setUid2audioSub((p) => {
                const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
                for(const [id, value] of p) {
                    if(id !== ctx.uid)
                        m.set(id, value)
                }
                const oldValue = p.get(ctx.uid)
                if(oldValue != null) {
                    const {audio_sync: oldAudioSync, ...rest} = oldValue
                    const newValue = {
                        audio_sync: !ctx.audioSync,
                        ...rest
                    } as UserAudioSubtitles;
                    m.set(ctx.uid, newValue)
                }
                return m
            })

            if(connectedToRoom) {
                ctx.socket!.emitWithAck('change_audio_sync', !ctx.audioSync)
                    .then((ack: SocketIoAck<null>) => {
                        if (ack.status === SocketIoAckType.Err) {
                            showPersistentErrorAlert(t('mpv-change-audio-sync-error'))
                            forceDisconnectFromRoom(ctx, t)
                        }
                    })
                    .catch(() => {
                        showPersistentErrorAlert(t('mpv-change-audio-sync-error'))
                        forceDisconnectFromRoom(ctx, t)
                    })
            }
        })
    }

    return (
        <Clickable className="p-2" onClick={audioSyncToggle}>
            {ctx.audioSync
                ? <Bubble className="h-7"/>
                : <BubbleCrossed className="h-7"/>
            }
        </Clickable>
    )
}