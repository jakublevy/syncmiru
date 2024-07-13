import {MainContextModel, RoomConnectionState} from "@models/context.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {UserId} from "@models/user.ts";
import {invoke} from "@tauri-apps/api/core";
import {showPersistentErrorAlert} from "./alert.ts";
import {TFunction} from "i18next";

export function forceDisconnectFromRoom(ctx: MainContextModel) {
    ctx.setRoomConnection(RoomConnectionState.Disconnecting)
    invoke('mpv_quit', {})
    ctx.socket?.emitWithAck("disconnect_room", {})
        .then((ack: SocketIoAck<null>) => {
            clearInterval(ctx.roomPingTimerRef?.current)
            ctx.setUidPing(new Map<UserId, number>())
            ctx.setCurrentRid(null)
            ctx.setRoomConnection(RoomConnectionState.Established)
        })
}

export function disconnectFromRoom(ctx: MainContextModel, t: TFunction<"translation", undefined>) {
    ctx.setRoomConnection(RoomConnectionState.Disconnecting)
    invoke('mpv_quit', {})
        .then(() => {
            ctx.socket!.emitWithAck("disconnect_room", {})
                .then((ack: SocketIoAck<null>) => {
                    if(ack.status === SocketIoAckType.Err) {
                        showPersistentErrorAlert(t('room-leave-failed'))
                    }
                    else {
                        clearInterval(ctx.roomPingTimerRef?.current)
                        ctx.setUidPing(new Map<UserId, number>())
                        ctx.setCurrentRid(null)
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