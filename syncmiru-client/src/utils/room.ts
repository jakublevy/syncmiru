import {MainContextModel, RoomConnectionState} from "@models/context.ts";
import {SocketIoAck} from "@models/socketio.ts";
import {UserId} from "@models/user.ts";

export function forceDisconnectFromRoom(ctx: MainContextModel) {
    ctx.setRoomConnection(RoomConnectionState.Disconnecting)
    ctx.socket?.emitWithAck("disconnect_room", {})
        .then((ack: SocketIoAck<null>) => {
            clearInterval(ctx.roomPingTimerRef?.current)
            ctx.setUidPing(new Map<UserId, number>())
            ctx.setCurrentRid(null)
            ctx.setRoomConnection(RoomConnectionState.Established)
        })
}