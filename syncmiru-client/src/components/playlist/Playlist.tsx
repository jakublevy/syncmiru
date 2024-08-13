import React, {MouseEvent, ReactElement, useEffect, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {
    PlaylistEntry,
    PlaylistEntryId,
    PlaylistEntrySubtitles,
    PlaylistEntrySubtitlesSrv,
    PlaylistEntryUrl,
    PlaylistEntryVideo,
    PlaylistEntryVideoSrv
} from "@models/playlist.ts";
import {arrayMove, List, OnChangeMeta, RenderListParams} from "react-movable";
import VideoFile from "@components/svg/VideoFile.tsx";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {
    showPersistentErrorAlert,
    showTemporalSuccessAlertForModal
} from "src/utils/alert.ts";
import {useTranslation} from "react-i18next";
import Delete from "@components/svg/Delete.tsx";
import Subtitles from "@components/svg/Subtitles.tsx";
import {ModalDelete} from "@components/widgets/Modal.tsx";
import SubFile from "@components/svg/SubFile.tsx";
import {RoomConnectionState} from "@models/context.ts";
import AddSubtitlesFromFileSrv from "@components/playlist/AddSubtitlesFromFileSrv.tsx";
import {MultiMap} from 'mnemonist'
import Copy from "@components/svg/Copy.tsx";
import {forceDisconnectFromRoom} from "src/utils/room.ts";

export default function Playlist(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()

    const [deletingPlaylistId, setDeletingPlaylistId] = useState<PlaylistEntryId>(0)
    const [showPlaylistEntryDeleteModal, setShowPlaylistEntryDeleteModal] = useState<boolean>(false)
    const connectedToRoom = ctx.currentRid != null && ctx.roomConnection === RoomConnectionState.Established

    const [showSubtitlesModal, setShowSubtitlesModal] = useState<boolean>(false)
    const [videoIdSelectedSubtitles, setVideoIdSelectedSubtitles] = useState<PlaylistEntryId>(0)
    const [mousePos, setMousePos] = useState<[number, number]>([0, 0])

    useEffect(() => {
        if (ctx.socket !== undefined) {
            ctx.socket.on('add_video_files', onAddVideoFiles)
            ctx.socket.on('add_urls', onAddUrls)
            ctx.socket.on('playlist_order', onPlaylistOrder)
            ctx.socket.on('del_playlist_entry', onDelPlaylistEntry)
        }
    }, [ctx.socket]);

    useEffect(() => {
        if(ctx.socket !== undefined) {
            ctx.socket.on('change_active_video', onChangeActiveVideo)
        }
    }, [ctx.socket, ctx.playlist, ctx.subtitles]);

    useEffect(() => {
        if(ctx.socket !== undefined) {
            ctx.socket.on('add_subtitles_files', onAddSubtitlesFiles)
        }
    }, [ctx.socket, ctx.activeVideoId]);

    useEffect(() => {
        if(ctx.currentRid == null) {
            ctx.setPlaylist(new Map<PlaylistEntryId, PlaylistEntry>())
            ctx.setPlaylistOrder([])
            ctx.setSubtitles(new MultiMap<PlaylistEntryId, PlaylistEntryId>(Set))
        }
    }, [ctx.currentRid, ctx.roomConnection]);

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

    function onAddVideoFiles(r: Record<string, PlaylistEntryVideoSrv>) {
        const m: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
        for (const idStr in r) {
            const value = r[idStr]
            m.set(parseInt(idStr), new PlaylistEntryVideo(value.source, value.path))
        }

        ctx.setPlaylist((p) => {
            if(p.size === 0)
                setAsActiveVideo(m.keys().next().value)

            return new Map<PlaylistEntryId, PlaylistEntry>([...p, ...m])
        })
        let entryIds = [...m.keys()]
        ctx.setPlaylistOrder((p) => [...new Set([...p, ...entryIds])])
    }

    function onAddSubtitlesFiles(r: Record<string, PlaylistEntrySubtitlesSrv>) {
        const m: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
        for (const idStr in r) {
            const value = r[idStr]
            m.set(parseInt(idStr), new PlaylistEntrySubtitles(value.source, value.path, value.video_id))
        }
        ctx.setPlaylist((p) => new Map<PlaylistEntryId, PlaylistEntry>([...p, ...m]))

        const subs: MultiMap<PlaylistEntryId, PlaylistEntryId, Set<PlaylistEntryId>> = new MultiMap<PlaylistEntryId, PlaylistEntryId>(Set)
        let promises = []
        const subJwtsTmp: Map<PlaylistEntryId, string> = new Map<PlaylistEntryId, string>()
        for(const idStr in r) {
            const value = r[idStr]
            const subId = parseInt(idStr)

            if(value.video_id === ctx.activeVideoId) {
                promises.push(ctx.socket!.emitWithAck("req_playing_jwt", {playlist_entry_id: subId})
                    .then((ack: SocketIoAck<string>) => {
                        if(ack.status === SocketIoAckType.Err) {
                            showPersistentErrorAlert(t('playlist-entry-req-jwt-error'))
                            forceDisconnectFromRoom(ctx, t)
                            return
                        }
                        const jwt = ack.payload as string
                        subJwtsTmp.set(subId, jwt)
                    })
                    .catch(() => {
                        showPersistentErrorAlert(t('playlist-entry-req-jwt-error'))
                        forceDisconnectFromRoom(ctx, t)
                        return
                    }))
            }
            subs.set(value.video_id, subId)
        }
        Promise.all(promises)
            .then(() => {
                ctx.setJwts((p) => new Map<PlaylistEntryId, string>([...p, ...subJwtsTmp]))
                ctx.setSubtitles((p) => {
                    const newSubs: MultiMap<PlaylistEntryId, PlaylistEntryId, Set<PlaylistEntryId>> = new MultiMap<PlaylistEntryId, PlaylistEntryId>(Set)
                    for (const [videoId, subId] of p) {
                        newSubs.set(videoId, subId)
                    }
                    for (const [videoId, subId] of subs) {
                        newSubs.set(videoId, subId)
                    }
                    return newSubs
                })
            })
    }

    function onAddUrls(r: Record<string, PlaylistEntryUrl>) {
        const m: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
        for (const idStr in r) {
            const value = r[idStr]
            m.set(parseInt(idStr), new PlaylistEntryUrl(value.url))
        }

        ctx.setPlaylist((p) => {
            return new Map<PlaylistEntryId, PlaylistEntry>([...p, ...m])
        })
        let entryIds = [...m.keys()]
        ctx.setPlaylistOrder((p) => [...new Set([...p, ...entryIds])])
    }

    function onPlaylistOrder(playlistOrder: Array<PlaylistEntryId>) {
        ctx.setPlaylistOrder(playlistOrder)
    }

    function onDelPlaylistEntry(entryId: PlaylistEntryId) {
        ctx.setPlaylist((playlist => {
            const newPlaylist: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()

            const entry = playlist.get(entryId)
            if(entry == null)
                return playlist

            if(entry instanceof PlaylistEntrySubtitles) {
                ctx.setSubtitles((p) => {
                    const subs: MultiMap<PlaylistEntryId, PlaylistEntryId, Set<PlaylistEntryId>> = new MultiMap<PlaylistEntryId, PlaylistEntryId>(Set)
                    for(const [vid, subId] of p) {
                        if(subId !== entryId)
                            subs.set(vid, subId)
                    }
                    return subs
                })
                for (const [k, v] of playlist) {
                    if(k !== entryId)
                        newPlaylist.set(k, v)
                }
                return newPlaylist
            }
            else {
                let playlistIdsToRemove = new Set<PlaylistEntryId>([entryId])
                const subIds = ctx.subtitles.get(entryId)
                if(subIds != null)
                    playlistIdsToRemove = new Set([...playlistIdsToRemove, ...subIds])


                ctx.setPlaylistOrder((p) => {
                    if(p.length > 1) {
                        setAsActiveVideo(p[1])
                    }
                    else {
                        ctx.setActiveVideoId(null)
                    }
                    return p.filter(x => x !== entryId)
                })

                ctx.setSubtitles((p) => {
                    const subs: MultiMap<PlaylistEntryId, PlaylistEntryId, Set<PlaylistEntryId>> = new MultiMap<PlaylistEntryId, PlaylistEntryId>(Set)
                    for(const [vid, subId] of p) {
                        if(vid != entryId)
                            subs.set(vid, subId)
                    }
                    return subs
                })

                for (const [k, v] of playlist) {
                    if(!playlistIdsToRemove.has(k))
                        newPlaylist.set(k, v)
                }
                return newPlaylist
            }
        }))
    }

    function onChangeActiveVideo(entryId: PlaylistEntryId) {
        const entry = ctx.playlist.get(entryId)
        if(entry == null)
            return

        const subs = ctx.subtitles.get(entryId)
        let reqIds: Set<PlaylistEntryId>
        if(subs == null) {
            reqIds = new Set<PlaylistEntryId>([entryId])
        }
        else {
            reqIds = new Set<PlaylistEntryId>([entryId, ...subs])
        }
        const jwtsTmp: Map<PlaylistEntryId, string> = new Map<PlaylistEntryId, string>()
        for(const id of reqIds) {
            ctx.socket!.emitWithAck("req_playing_jwt", {playlist_entry_id: id})
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
                })
        }
        ctx.setJwts(jwtsTmp)
        ctx.setActiveVideoId(entryId)
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

    function addSubtitlesToPlaylist(videoId: PlaylistEntryId) {
        setVideoIdSelectedSubtitles(videoId)
        setShowSubtitlesModal(true)
    }

    async function copyVideoUrl(entry: PlaylistEntryUrl) {
        await navigator.clipboard.writeText(entry.url);
        showTemporalSuccessAlertForModal(t('video-url-copied'))
    }

    function entryPic(entry: PlaylistEntry) {
        if(entry instanceof PlaylistEntrySubtitles)
            return <SubFile className="min-w-6 w-6"/>
        return <VideoFile className="min-w-6 w-6"/>
    }

    function entryPrettyText(entry: PlaylistEntry) {
        if (entry instanceof PlaylistEntryVideo) {
            const e = entry as PlaylistEntryVideo
            return `${e.source}:${e.path}`
        }
        else if(entry instanceof PlaylistEntrySubtitles) {
            const e = entry as PlaylistEntrySubtitles
            return `${e.source}:${e.path}`
        }
        else if (entry instanceof PlaylistEntryUrl) {
            const e = entry as PlaylistEntryUrl
            return e.url
        }
        return ''
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

                        const renderTxt = entryPrettyText(entry)
                        let subs: Set<PlaylistEntryId> = new Set()
                        let s = ctx.subtitles.get(playlistEntryId)
                        if(s != null)
                            subs = s

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
                                        <p className={`text-sm ${ctx.activeVideoId === playlistEntryId ? 'font-bold' : ''}`}>{renderTxt}</p>
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
                                                addSubtitlesToPlaylist(playlistEntryId)
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onMouseUp={(e) => e.stopPropagation()}
                                        >
                                            <Subtitles className="w-full h-full"/>
                                        </div>

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
                                    {subs.size > 0 && <div className="flex flex-col gap-y-0.5 mb-4">
                                        {Array.from(subs).map(subId => {
                                            const sub = ctx.playlist.get(subId)
                                            if(sub == null)
                                                return <></>

                                            return (
                                                <div
                                                    key={subId}
                                                    className="flex items-center gap-x-2 px-2 py-1.5 ml-8 hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer rounded group">
                                                    <SubFile
                                                        key={`${subId}_svg`}
                                                        className="min-w-4 w-4"/>
                                                    <p key={`${subId}_p`} className="text-xs">{entryPrettyText(sub)}</p>
                                                    <div key={`${subId}_spacer`} className="flex-1"></div>
                                                    <div
                                                        key={`${subId}_del`}
                                                        role="button"
                                                        className='flex items-center rounded p-1 mr-1 hover:bg-gray-300 dark:hover:bg-gray-500 invisible group-hover:visible min-h-6 h-6 min-w-6 w-6'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteFromPlaylist(subId)
                                                        }}
                                                    >
                                                        <Delete className="w-full h-full"/>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>}
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

                    const pic = entryPic(entry)
                    const renderTxt = entryPrettyText(entry)
                    return (
                        <div key={eid} className="flex gap-x-2 items-center">
                            {pic}
                            <p className={`text-sm ${ctx.activeVideoId === eid ? 'font-bold' : ''}`}>{renderTxt}</p>
                        </div>
                    )
                }))
                }
            />
            <AddSubtitlesFromFileSrv
                videoId={videoIdSelectedSubtitles}
                showModal={showSubtitlesModal}
                setShowModal={setShowSubtitlesModal}
            />
        </>
    )
}
