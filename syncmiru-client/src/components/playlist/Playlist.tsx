import React, {MouseEvent, ReactElement, useEffect, useRef, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {
    AddUrlFilesRespSrv,
    AddVideoFilesRespSrv, ChangePlaylistOrder, DeletePlaylistEntry,
    PlaylistEntry,
    PlaylistEntryId,
    PlaylistEntryUrl,
    PlaylistEntryVideo,
} from "@models/playlist.ts";
import {arrayMove, List, OnChangeMeta, RenderListParams} from "react-movable";
import VideoFile from "@components/svg/VideoFile.tsx";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert, showTemporalSuccessAlertForModal} from "src/utils/alert.ts";
import {useTranslation} from "react-i18next";
import Delete from "@components/svg/Delete.tsx";
import {ModalDelete} from "@components/widgets/Modal.tsx";
import {RoomConnectionState} from "@models/context.ts";
import Copy from "@components/svg/Copy.tsx";
import {invoke} from "@tauri-apps/api/core";
import {UserId} from "@models/user.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {UserAudioSubtitles} from "@models/mpv.ts";
import {hideMpvReadyMessages, MpvMsgMood} from "src/utils/mpv.ts";
import {changeActiveVideo} from "src/utils/playlist.ts";

export default function Playlist(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()

    const [deletingPlaylistId, setDeletingPlaylistId] = useState<PlaylistEntryId>(0)
    const [showPlaylistEntryDeleteModal, setShowPlaylistEntryDeleteModal] = useState<boolean>(false)
    const connectedToRoom = ctx.currentRid != null && ctx.roomConnection === RoomConnectionState.Established

    const [mousePos, setMousePos] = useState<[number, number]>([0, 0])

    const usersRef = useRef(ctx.users)

    useEffect(() => {
        if (ctx.socket !== undefined) {
            ctx.socket.on('add_video_files', onAddVideoFiles)
            ctx.socket.on('add_urls', onAddUrls)
            ctx.socket.on('playlist_order', onPlaylistOrder)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('add_video_files', onAddVideoFiles)
                ctx.socket.off('add_urls', onAddUrls)
                ctx.socket.off('playlist_order', onPlaylistOrder)
            }
        }
    }, [ctx.socket]);

    useEffect(() => {
        if(ctx.socket !== undefined) {
            ctx.socket.on('del_playlist_entry', onDelPlaylistEntry)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('del_playlist_entry', onDelPlaylistEntry)
            }
        }
    }, [ctx.socket, ctx.activeVideoId])

    useEffect(() => {
        if(ctx.socket !== undefined) {
            ctx.socket.on('change_active_video', onChangeActiveVideo)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('change_active_video', onChangeActiveVideo)
            }
        }
    }, [ctx.socket]);

    useEffect(() => {
        if(ctx.currentRid == null) {
            ctx.setPlaylist(new Map<PlaylistEntryId, PlaylistEntry>())
            ctx.setPlaylistOrder([])
        }
    }, [ctx.currentRid, ctx.roomConnection]);

    useEffect(() => {
        usersRef.current = ctx.users
    }, [ctx.users]);

    function setAsActiveVideo(entryId: PlaylistEntryId) {
        ctx.socket!.emitWithAck("change_active_video", {playlist_entry_id: entryId})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('video-set-active-error'))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('video-set-active-error'))
            })
    }

    function onAddVideoFiles(r: AddVideoFilesRespSrv) {
        const m: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
        for (const idStr in r.entries) {
            const value = r.entries[idStr]
            m.set(parseInt(idStr), new PlaylistEntryVideo(value.source, value.path))
        }

        ctx.setPlaylist((p) => {
            if(p.size === 0)
                setAsActiveVideo(m.keys().next().value as number)

            return new Map<PlaylistEntryId, PlaylistEntry>([...p, ...m])
        })
        let entryIds = [...m.keys()]
        ctx.setPlaylistOrder((p) => [...new Set([...p, ...entryIds])])

        const userValue = usersRef.current.get(r.uid)
        if (userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-playlist-add')}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }


    function onAddUrls(r: AddUrlFilesRespSrv) {
        const m: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
        for (const idStr in r.entries) {
            const value = r.entries[idStr]
            m.set(parseInt(idStr), new PlaylistEntryUrl(value.url))
        }

        ctx.setPlaylist((p) => {
            if(p.size === 0)
                setAsActiveVideo(m.keys().next().value as number)

            return new Map<PlaylistEntryId, PlaylistEntry>([...p, ...m])
        })
        let entryIds = [...m.keys()]
        ctx.setPlaylistOrder((p) => [...new Set([...p, ...entryIds])])

        const userValue = usersRef.current.get(r.uid)
        if (userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-playlist-add')}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onPlaylistOrder(changePlaylistOrder: ChangePlaylistOrder) {
        ctx.setPlaylistOrder(changePlaylistOrder.order)

        const userValue = usersRef.current.get(changePlaylistOrder.uid)
        if (userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-playlist-order-change')}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onDelPlaylistEntry(deletePlaylistEntry: DeletePlaylistEntry) {
        ctx.setPlaylist((playlist => {
            const newPlaylist: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()

            const entry = playlist.get(deletePlaylistEntry.entry_id)
            if(entry == null)
                return playlist

            let playlistIdsToRemove = new Set<PlaylistEntryId>([deletePlaylistEntry.entry_id])

            ctx.setPlaylistOrder((p) => {
                const m = p.filter(x => x !== deletePlaylistEntry.entry_id)
                if(ctx.activeVideoId === deletePlaylistEntry.entry_id && m.length > 0)
                    setAsActiveVideo(m[0])
                else if (m.length == 0) {
                    hideMpvReadyMessages(t)
                    ctx.setActiveVideoId(null)
                    clearInterval(ctx.timestampTimerRef?.current)
                    ctx.setUid2ready((p) => {
                        const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
                        for (const [id, value] of p)
                            m.set(id, UserReadyState.Loading)
                        return m
                    })
                    ctx.setUid2audioSub(new Map<UserId, UserAudioSubtitles>())
                }
                return m
            })

            for (const [k, v] of playlist) {
                if(!playlistIdsToRemove.has(k))
                    newPlaylist.set(k, v)
            }
            if(newPlaylist.size === 0)
                invoke('mpv_remove_current_from_playlist', {})
                    .catch(() => {
                        showPersistentErrorAlert(t('mpv-remove-from-playlist-error'))
                    })

            return newPlaylist
        }))

        const userValue = usersRef.current.get(deletePlaylistEntry.uid)
        if (userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-playlist-del')}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onChangeActiveVideo(entryId: PlaylistEntryId) {
        ctx.setUid2ready((p) => {
            const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
            for (const [id, value] of p) {
                m.set(id, UserReadyState.Loading)
            }
            return m
        })

        changeActiveVideo(ctx, t, entryId)
    }

    function orderChanged(e: OnChangeMeta) {
        let oldOrder: Array<PlaylistEntryId>
        const newOrder = arrayMove(ctx.playlistOrder, e.oldIndex, e.newIndex)
        ctx.setPlaylistOrder((p) => {
            oldOrder = p
            return newOrder
        })
        ctx.socket!.emitWithAck("set_playlist_order", {playlist_order: newOrder})
            .then((ack: SocketIoAck<null>) => {
                if (ack.status === SocketIoAckType.Err) {
                    ctx.setPlaylistOrder(oldOrder)
                    showPersistentErrorAlert(t('playlist-order-change-error'))
                }
                else {
                    const userValue = usersRef.current.get(ctx.uid)
                    if (userValue != null) {
                        const msgText = `${userValue.displayname} ${t('mpv-msg-playlist-order-change')}`
                        invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                            .catch(() => {
                                showPersistentErrorAlert(t('mpv-msg-show-failed'))
                            })
                    }
                }
            })
            .catch(() => {
                ctx.setPlaylistOrder(oldOrder)
                showPersistentErrorAlert(t('playlist-order-change-error'))
            })
    }

    function deleteFromPlaylist(eid: PlaylistEntryId) {
        setDeletingPlaylistId(eid)
        setShowPlaylistEntryDeleteModal(true)
    }

    function deleteFromPlaylistConfirmed() {
        ctx.socket!.emitWithAck("delete_playlist_entry", {playlist_entry_id: deletingPlaylistId})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err)
                    showPersistentErrorAlert(t('playlist-delete-error'))
            })
            .catch(() => {
                showPersistentErrorAlert(t('playlist-delete-error'))
            })
    }

    async function copyVideoUrl(entry: PlaylistEntryUrl) {
        await navigator.clipboard.writeText(entry.url);
        showTemporalSuccessAlertForModal(t('video-url-copied'))
    }

    function onPlaylistEntryMouseDown(e: MouseEvent<HTMLDivElement>, entryId: PlaylistEntryId) {
        setMousePos([e.clientX, e.clientY])
    }

    function onPlaylistEntryMouseUp(e: MouseEvent<HTMLDivElement>, entryId: PlaylistEntryId) {
        if(e.button !== 0)
            return

        const x = e.clientX - mousePos[0]
        const y = e.clientY - mousePos[1]
        if (x * x + y * y <= 25)
            playlistEntryClicked(entryId)
    }

    function playlistEntryClicked(entryId: PlaylistEntryId) {
        setAsActiveVideo(entryId)
    }

    if (ctx.playlistLoading) {
        return <div className="flex justify-center items-center h-full">
            <Loading/>
        </div>
    }
    return (
        <>
            <div className="h-full">
                {!connectedToRoom
                    ? <p className="flex justify-center pt-6">{t('playlist-not-connected-to-room-msg')}</p>
                    : ctx.playlist.size === 0 && <p className="flex justify-center pt-6">{t('playlist-empty-msg')}</p>}
                <List
                    onChange={orderChanged}
                    values={ctx.playlistOrder}
                    renderList={({children, props}: RenderListParams) => {
                        return (
                            <ul
                                {...props}
                                className="flex-1 overflow-auto p-1"
                            >{children}</ul>
                        )
                    }}
                    renderItem={({value: playlistEntryId, props}) => {
                        const {key, ...restProps} = props
                        const entry = ctx.playlist.get(playlistEntryId)
                        if (entry == null) {
                            return (
                                <></>
                            )
                        }

                        const renderTxt = entry.pretty()
                        return (
                            <li
                                key={key}
                                {...restProps}
                                style={{
                                    ...props.style,
                                    listStyleType: 'none'
                                }}
                            >
                                <div className="flex flex-col">
                                    <div
                                        data-movable-handle={true}
                                        onMouseDown={(e) => onPlaylistEntryMouseDown(e, playlistEntryId)}
                                        onMouseUp={(e) => onPlaylistEntryMouseUp(e, playlistEntryId)}
                                        className="flex items-center mb-0.5 gap-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer rounded group">
                                        <VideoFile className="min-w-6 w-6"/>
                                        <p className={`text-sm break-words break-all ${ctx.activeVideoId === playlistEntryId ? 'font-bold' : ''}`}>{renderTxt}</p>
                                        <div className="flex-1"></div>
                                        {entry instanceof PlaylistEntryUrl &&
                                            <div
                                                role="button"
                                                className='flex items-center rounded hover:bg-gray-300 p-1.5 dark:hover:bg-gray-500 invisible group-hover:visible min-h-8 h-8 min-w-8 w-8'
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    await copyVideoUrl(entry)
                                                }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onMouseUp={(e) => e.stopPropagation()}
                                            >
                                                <Copy className="w-full h-full" fill="currentColor"/>
                                            </div>
                                        }
                                        <div
                                            role="button"
                                            className='flex items-center rounded hover:bg-gray-300 p-1.5 dark:hover:bg-gray-500 invisible group-hover:visible min-h-8 h-8 min-w-8 w-8'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteFromPlaylist(playlistEntryId)
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onMouseUp={(e) => e.stopPropagation()}
                                        >
                                            <Delete className="w-full h-full"/>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        )
                    }}
                />
            </div>
            <ModalDelete
                onDeleteConfirmed={deleteFromPlaylistConfirmed}
                open={showPlaylistEntryDeleteModal}
                setOpen={setShowPlaylistEntryDeleteModal}
                content={
                    [deletingPlaylistId].map((eid => {
                        const entry = ctx.playlist.get(eid)
                    if(entry == null)
                        return <div key={eid}></div>

                    const renderTxt = entry.pretty()
                    return (
                        <div key={eid} className="flex gap-x-2 items-center">
                            <VideoFile className="min-w-6 w-6"/>
                            <p className={`text-sm break-words break-all ${ctx.activeVideoId === eid ? 'font-bold' : ''}`}>{renderTxt}</p>
                        </div>
                    )
                }))
                }
            />
        </>
    )
}
