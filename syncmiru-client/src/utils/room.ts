import {MainContextModel, RoomConnectionState} from "@models/context.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {UserId} from "@models/user.ts";
import {invoke} from "@tauri-apps/api/core";
import {showPersistentErrorAlert} from "./alert.ts";
import {TFunction} from "i18next";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {RoomId} from "@models/room.ts";
import {PlaylistEntry, PlaylistEntryId} from "@models/playlist.ts";
import {MultiMap} from "mnemonist";

export function forceDisconnectFromRoom(ctx: MainContextModel, t: TFunction<"translation", undefined>) {
    ctx.setRoomConnection(RoomConnectionState.Disconnecting)
    invoke('mpv_quit', {})
        .then(() => {
            ctx.setMpvRunning(false)
            ctx.socket?.emitWithAck("disconnect_room", {})
                .then((ack: SocketIoAck<null>) => {
                    clearValuesAfterDisconnect(ctx)
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
                        clearValuesAfterDisconnect(ctx)
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

function clearValuesAfterDisconnect(ctx: MainContextModel) {
    ctx.setRoomUidClicked(-1)
    ctx.setUsersClickedUid(-1)
    clearInterval(ctx.roomPingTimerRef?.current)
    ctx.setCurrentRid(null)
    ctx.setUidPing(new Map<UserId, number>())
    ctx.setPlaylist(new Map<PlaylistEntryId, PlaylistEntry>())
    ctx.setPlaylistOrder([])
    ctx.setSubtitles(new MultiMap<PlaylistEntryId, PlaylistEntryId>(Set))
    ctx.setJwts(new Map<PlaylistEntryId, string>())
    ctx.setUid2ready(new Map<UserId, UserReadyState>())
    ctx.setActiveVideoId(null)
    ctx.setMpvRunning(false)
}