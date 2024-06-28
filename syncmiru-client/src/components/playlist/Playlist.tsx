import React, {ReactElement, useEffect, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {
    PlaylistEntry,
    PlaylistEntryId,
    PlaylistEntrySubtitles,
    PlaylistEntryUrl,
    PlaylistEntryValueSrv,
    PlaylistEntryVideo
} from "@models/playlist.ts";
import {arrayMove, List, OnChangeMeta, RenderListParams} from "react-movable";
import VideoFile from "@components/svg/VideoFile.tsx";
import Multimap from 'multimap';
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "../../utils/alert.ts";
import {useTranslation} from "react-i18next";
import Delete from "@components/svg/Delete.tsx";
import Subtitles from "@components/svg/Subtitles.tsx";
import {ModalDelete} from "@components/widgets/Modal.tsx";
import SubFile from "@components/svg/SubFile.tsx";
import {RoomConnectionState} from "@models/context.ts";

export default function Playlist(): ReactElement {
    const {
        socket,
        playlistLoading,
        roomConnection,
        currentRid,
        playlist,
        setPlaylist,
        playlistOrder,
        setPlaylistOrder
    } = useMainContext()
    const {t} = useTranslation()

    const [subtitles, setSubtitles] = useState<Multimap<PlaylistEntryId, PlaylistEntryId>>(new Multimap<PlaylistEntryId, PlaylistEntryId>())
    const [playingId, setPlayingId] = useState<PlaylistEntryId | null>(null)
    const [deletingPlaylistId, setDeletingPlaylistId] = useState<PlaylistEntryId>(0)
    const [showVideoDeleteModal, setShowVideoDeleteModal] = useState<boolean>(false)
    const connectedToRoom = currentRid != null && roomConnection === RoomConnectionState.Established

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('add_video_files', onAddVideoFiles)
            socket.on('playlist_order', onPlaylistOrder)
            socket.on('del_playlist_entries', onDelPlaylistEntries)
        }
    }, [socket]);

    function setAsPlaying(entryId: PlaylistEntryId) {
        // TODO: notify server
        // TODO: set playingId
    }

    function onAddVideoFiles(r: Record<string, PlaylistEntryValueSrv>) {
        console.log('add called')
        const m: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
        for (const idStr in r) {
            const value = r[idStr]
            m.set(parseInt(idStr), new PlaylistEntryVideo(value.source, value.path))
        }
        setPlaylist((p) => {
            if (p.size === 0)
                setAsPlaying(m.keys().next().value)

            return new Map<PlaylistEntryId, PlaylistEntry>([...p, ...m])
        })
        let entryIds = [...m.keys()]
        setPlaylistOrder((p) => [...p, ...entryIds])
    }

    function onPlaylistOrder(playlistOrder: Array<PlaylistEntryId>) {
        setPlaylistOrder(playlistOrder)
    }

    function onDelPlaylistEntries(entryIds: Array<PlaylistEntryId>) {
        setPlaylistOrder((p) => p.filter(x => !entryIds.includes(x)))
        setPlaylist((p) => {
            const m: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
            for (const [k, v] of p) {
                if(!entryIds.includes(k))
                    m.set(k, v)
            }
            return m
        })
    }

    function orderChanged(e: OnChangeMeta) {
        let oldOrder: Array<PlaylistEntryId>
        const newOrder = arrayMove(playlistOrder, e.oldIndex, e.newIndex)
        setPlaylistOrder((p) => {
            oldOrder = p
            return newOrder
        })
        socket!.emitWithAck("set_playlist_order", {playlist_order: newOrder})
            .then((ack: SocketIoAck<null>) => {
                if (ack.status === SocketIoAckType.Err) {
                    setPlaylistOrder(oldOrder)
                    showPersistentErrorAlert(t('playlist-order-change-error'))
                }
            })
            .catch(() => {
                setPlaylistOrder(oldOrder)
                showPersistentErrorAlert(t('playlist-order-change-error'))
            })
    }

    function deleteFromPlaylist(eid: PlaylistEntryId) {
        setDeletingPlaylistId(eid)
        setShowVideoDeleteModal(true)
    }

    function deleteFromPlaylistConfirmed() {
        socket!.emitWithAck("delete_playlist_entry", {playlist_entry_id: deletingPlaylistId})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err)
                    showPersistentErrorAlert(t('playlist-delete-error'))
            })
            .catch(() => {
                showPersistentErrorAlert(t('playlist-delete-error'))
            })
            .finally(() => {

            })
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

    if (playlistLoading) {
        return <div className="flex justify-center items-center h-full">
            <Loading/>
        </div>
    }
    return (
        <>
            <div className="h-full">
                {!connectedToRoom
                    ? <p className="flex justify-center pt-6">{t('playlist-not-connected-to-room-msg')}</p>
                    : playlist.size === 0 && <p className="flex justify-center pt-6">{t('playlist-empty-msg')}</p>}
                <List
                    onChange={orderChanged}
                    values={playlistOrder}
                    renderList={({children, props}: RenderListParams) => {
                        return (
                            <ul
                                {...props}
                                className="border-l flex-1 overflow-auto p-1"
                            >{children}</ul>
                        )
                    }}
                    renderItem={({value: playlistEntryId, props}) => {
                        const {key, ...restProps} = props
                        const entry = playlist.get(playlistEntryId)
                        if (entry == null) {
                            return (
                                <></>
                            )
                        }

                        const renderTxt = entryPrettyText(entry)

                        let subs = []
                        if (subtitles.has(playlistEntryId)) {
                            subs = subtitles
                                .get(playlistEntryId)
                                .map(id => playlist.get(id) as PlaylistEntry)
                        }
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
                                        className="flex items-center mb-0.5 gap-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer rounded group">
                                        <VideoFile className="min-w-6 w-6"/>
                                        <p className={`text-sm ${playingId === playlistEntryId ? 'font-bold' : ''}`}>{renderTxt}</p>
                                        <div className="flex-1"></div>
                                        <div
                                            role="button"
                                            className='flex items-center rounded hover:bg-gray-300 p-1.5 dark:hover:bg-gray-500 invisible group-hover:visible min-h-8 h-8 min-w-8 w-8'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onMouseUp={(e) => e.stopPropagation()}
                                        >
                                            <Subtitles/>
                                        </div>

                                        {/*<BtnSecondarySvg className="min-h-9 h-9 min-w-9 w-9 group-hover:visible invisible">*/}
                                        {/*    <Subtitles/>*/}
                                        {/*</BtnSecondarySvg>*/}

                                        {/*<DeleteBtn className="min-w-9 w-9 group-hover:visible invisible"/>*/}

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
                                            <Delete/>
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
                open={showVideoDeleteModal}
                setOpen={setShowVideoDeleteModal}
                content={
                [deletingPlaylistId].map((eid => {
                    const entry = playlist.get(eid)
                    if(entry == null)
                        return <></>

                    const pic = entryPic(entry)
                    const renderTxt = entryPrettyText(entry)
                    return (
                        <div className="flex gap-x-2 items-center">
                            {pic}
                            <p className={`text-sm ${playingId === eid ? 'font-bold' : ''}`}>{renderTxt}</p>
                        </div>
                    )
                }))
                }
            />
        </>
    )
}
