import {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Clickable} from "@components/widgets/Button.tsx";
import Bubble from "@components/svg/Bubble.tsx";
import BubbleCrossed from "@components/svg/BubbleCrossed.tsx";
import {useChangeAudioSync} from "@hooks/useAudioSync.ts";
import {RoomConnectionState} from "@models/context.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {disconnectFromRoom, forceDisconnectFromRoom} from "src/utils/room.ts";
import {useTranslation} from "react-i18next";

export default function AudioSyncBtn(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()
    const changeAudioSync = useChangeAudioSync()

    const connectedToRoom = ctx.currentRid != null && ctx.roomConnection === RoomConnectionState.Established

    function audioSyncToggle() {
        changeAudioSync(!ctx.audioSync).then(() => {
            ctx.setAudioSync(!ctx.audioSync)
            if(connectedToRoom) {
                ctx.socket!.emitWithAck('change_audio_sync', !ctx.audioSync)
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