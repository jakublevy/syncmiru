import {MainContextModel, RoomConnectionState} from "@models/context.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {UserId} from "@models/user.ts";
import {invoke} from "@tauri-apps/api/core";
import {showPersistentErrorAlert} from "./alert.ts";
import {TFunction} from "i18next";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";

export function forceDisconnectFromRoom(ctx: MainContextModel, t: TFunction<"translation", undefined>) {
    ctx.setRoomConnection(RoomConnectionState.Disconnecting)
    invoke('mpv_quit', {})
        .then(() => {
            ctx.socket?.emitWithAck("disconnect_room", {})
                .then((ack: SocketIoAck<null>) => {
                    clearInterval(ctx.roomPingTimerRef?.current)
                    ctx.setUidPing(new Map<UserId, number>())
                    ctx.setCurrentRid(null)
                    ctx.setRoomConnection(RoomConnectionState.Established)
                    ctx.setUid2ready(new Map<UserId, UserReadyState>())
                })
        })
        .catch(() => {
            invoke('kill_app_with_error_msg', {msg: t('mpv-quit-error')})
        })
}

export function disconnectFromRoom(ctx: MainContextModel, t: TFunction<"translation", undefined>) {
    ctx.setRoomConnection(RoomConnectionState.Disconnecting)
    invoke('mpv_quit', {})
        .then(() => {
            ctx.setMpvRunning(false)
            ctx.socket!.emitWithAck("disconnect_room", {})
                .then((ack: SocketIoAck<null>) => {
                    if(ack.status === SocketIoAckType.Err) {
                        showPersistentErrorAlert(t('room-leave-failed'))
                    }
                    else {
                        clearInterval(ctx.roomPingTimerRef?.current)
                        ctx.setUidPing(new Map<UserId, number>())
                        ctx.setCurrentRid(null)
                        ctx.setUid2ready(new Map<UserId, UserReadyState>())
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('room-leave-failed'))
                    ctx.setRoomConnection(RoomConnectionState.Established)
                })
                .finally(() => {
                    ctx.setRoomConnection(RoomConnectionState.Established)
                })
        })
        .catch(() => {
            showPersistentErrorAlert(t('room-leave-failed'))
            ctx.setRoomConnection(RoomConnectionState.Established)
        })
}