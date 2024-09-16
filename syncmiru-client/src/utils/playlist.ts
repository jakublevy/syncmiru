import {PlaylistEntryId, PlaylistEntryVideo} from "@models/playlist.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {forceDisconnectFromRoom} from "src/utils/room.ts";
import {MainContextModel} from "@models/context.ts";
import {TFunction} from "i18next";

export function changeActiveVideo(ctx: MainContextModel, t: TFunction<"translation", undefined>, entryId: PlaylistEntryId) {
    ctx.setPlaylist((playlist) => {
        const entry = playlist.get(entryId)

        let reqIds: Set<PlaylistEntryId> = new Set<PlaylistEntryId>()

        if(entry instanceof PlaylistEntryVideo)
            reqIds.add(entryId)

        const jwtsTmp: Map<PlaylistEntryId, string> = new Map<PlaylistEntryId, string>()
        let promises = []
        for(const id of reqIds) {
            promises.push(ctx.socket!.emitWithAck("req_playing_jwt", {playlist_entry_id: id})
                .then((ack: SocketIoAck<string>) => {
                    if(ack.status === SocketIoAckType.Err) {
                        showPersistentErrorAlert(t('playlist-entry-req-jwt-error'))
                        forceDisconnectFromRoom(ctx, t)
                        return
                    }
                    const jwt = ack.payload as string
                    jwtsTmp.set(entryId, jwt)
                })
                .catch(() => {
                    showPersistentErrorAlert(t('playlist-entry-req-jwt-error'))
                    forceDisconnectFromRoom(ctx, t)
                    return
                }))
        }
        Promise.all(promises)
            .then(() => {
                ctx.setJwts(jwtsTmp)
                ctx.setActiveVideoId(entryId)
            })

        return playlist
    })
}