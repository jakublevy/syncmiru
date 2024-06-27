import React, {ReactElement, useEffect, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {
    PlaylistEntry,
    PlaylistEntryId, PlaylistEntryUrl,
    PlaylistEntryValueSrv,
    PlaylistEntryVideo
} from "@models/playlist.ts";
import {arrayMove, List, OnChangeMeta, RenderListParams} from "react-movable";
import VideoFile from "@components/svg/VideoFile.tsx";
import Multimap from 'multimap';
import {RoomId} from "@models/room.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "../../utils/alert.ts";
import {useTranslation} from "react-i18next";

export default function Playlist(): ReactElement {
    const {
        socket,
        playlistLoading
    } = useMainContext()
    const {t} = useTranslation()

    const [playlist, setPlaylist] = useState<Map<PlaylistEntryId, PlaylistEntry>>(new Map<PlaylistEntryId, PlaylistEntry>())
    const [playlistOrder, setPlaylistOrder] = useState<Array<PlaylistEntryId>>([])
    const [subtitles, setSubtitles] = useState<Multimap<PlaylistEntryId, PlaylistEntryId>>(new Multimap<PlaylistEntryId, PlaylistEntryId>())
    const [playingId, setPlayingId] = useState<PlaylistEntryId | null>(null)

    useEffect(() => {
        if(socket !== undefined) {
            socket.on('add_video_files', onAddVideoFiles)
            socket.on('playlist_order', onPlaylistOrder)
        }
    }, [socket]);

    function setAsPlaying(entryId: PlaylistEntryId) {
        // TODO: notify server
        // TODO: set playingId
    }

    function onAddVideoFiles(r: Record<string, PlaylistEntryValueSrv>) {
        const m: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
        for(const idStr in r) {
            const value = r[idStr]
            m.set(parseInt(idStr), new PlaylistEntryVideo(value.source, value.path))
        }
        setPlaylist((p) => {
            if(p.size === 0)
                setAsPlaying(m.keys().next().value)

            return new Map<PlaylistEntryId, PlaylistEntry>([...p, ...m])
        })
        let entryIds = [...m.keys()]
        setPlaylistOrder((p) => [...p, ...entryIds])
    }

    function onPlaylistOrder(playlistOrder: Array<PlaylistEntryId>) {
        setPlaylistOrder(playlistOrder)
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

    if(playlistLoading) {
        return <div className="flex justify-center items-center h-full">
            <Loading/>
        </div>
    }
    return (
        <div className="h-full">
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
                    if(entry == null) {
                        return (
                            <></>
                        )
                    }

                    let renderTxt = ""
                    if(entry instanceof PlaylistEntryVideo) {
                        const e = entry as PlaylistEntryVideo
                        renderTxt = `${e.source}:${e.path}`
                    }
                    else if(entry instanceof PlaylistEntryUrl) {
                        const e = entry as PlaylistEntryUrl
                        renderTxt = e.url
                    }

                    let subs = []
                    if(subtitles.has(playlistEntryId)) {
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
                        <div className="flex items-center mb-0.5 gap-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer rounded">
                            <VideoFile className="min-w-6 w-6"/>
                            <p className={`text-sm ${playingId === playlistEntryId ? 'font-bold' : ''}`}>{renderTxt}</p>
                        </div>
                        </li>
                    )
                }}
            />
        </div>
    )
}
