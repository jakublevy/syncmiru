import {ChangeEvent, MouseEvent, ReactElement} from "react";
import {Checkbox} from "@components/widgets/Input.tsx";
import Label from "@components/widgets/Label.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useTranslation} from "react-i18next";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {UserId} from "@models/user.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function ReadyBtn(): ReactElement {
    const {t} = useTranslation()
    const ctx = useMainContext()
    const ready = ctx.uid2ready.get(ctx.uid)
    const readyEnabled = ready === UserReadyState.NotReady || ready == UserReadyState.Ready

    function containerClicked(e: MouseEvent<HTMLDivElement>) {
        if((e.target as HTMLElement).tagName !== "DIV")
            return

        readyChangeReq()
    }

    function readyChanged(e: ChangeEvent<HTMLInputElement>) {
        readyChangeReq()
    }

    function readyChangeReq() {
        if(!readyEnabled)
            return

        let newState = UserReadyState.Ready
        if(ready === UserReadyState.Ready)
            newState = UserReadyState.NotReady

        ctx.socket!.emitWithAck('user_ready_state_change', {ready_state: newState})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('ready-state-change-error'))
                }
                else {
                    ctx.setUid2ready((p) => {
                        const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
                        for (const [id, value] of p) {
                            if(ctx.uid !== id) {
                                m.set(id, value)
                            }
                        }
                        m.set(ctx.uid, newState)
                        return m
                    })
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('ready-state-change-error'))
            })
    }

    return (
        <div
            className={`flex items-center gap-x-1.5 border py-1 px-4 ${readyEnabled ? 'hover:cursor-pointer' : ''}`}
            onClick={containerClicked}
        >
            <div>
                <Checkbox
                    id="ready"
                    className={`${readyEnabled ? 'hover:cursor-pointer' : ''}`}
                    checked={ready === UserReadyState.Ready}
                    onChange={readyChanged}
                    disabled={!readyEnabled}
                />
            </div>
            <Label
                className={`mt-1 select-none ${readyEnabled ? 'hover:cursor-pointer' : 'opacity-30'}`}
                htmlFor="ready">{t('ready-btn')}</Label>
        </div>
    )
}