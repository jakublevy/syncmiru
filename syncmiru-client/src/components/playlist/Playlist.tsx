import React, {ReactElement, useEffect, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {
    PlaylistEntry,
    PlaylistEntryId,
    PlaylistEntryValueSrv,
    PlaylistEntryVideo
} from "@models/playlist.ts";

export default function Playlist(): ReactElement {
    const {
        socket,
        playlistLoading
    } = useMainContext()

    const [playlist, setPlaylist] = useState<Map<PlaylistEntryId, PlaylistEntry>>(new Map<PlaylistEntryId, PlaylistEntry>())
    const [playlistOrder, setPlaylistOrder] = useState<Array<PlaylistEntryId>>([])

    useEffect(() => {
        if(socket !== undefined) {
            socket.on('add_video_files', onAddVideoFiles)
        }
    }, [socket]);

    function onAddVideoFiles(r: Record<string, PlaylistEntryValueSrv>) {
        const m: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
        for(const idStr in r) {
            const value = r[idStr]
            m.set(parseInt(idStr), new PlaylistEntryVideo(value.source, value.path))
        }
        setPlaylist((p) => {
            return new Map<PlaylistEntryId, PlaylistEntry>([...p, ...m])
        })
        let entryIds =  new Array<PlaylistEntryId>(...m.keys())
        setPlaylistOrder((p) => [...p, ...entryIds])
    }

    if(playlistLoading) {
        return <div className="flex justify-center items-center h-full">
            <Loading/>
        </div>
    }
    return (
        <div className="h-full">
            <ul>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
                <li>ahoj</li>
            </ul>
        </div>
    )
}
