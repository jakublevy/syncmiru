import {ReactElement} from "react";
import Log from "@components/Log.tsx";
import Mpv from "@components/Mpv.tsx";
import Playlist from "@components/Playlist.tsx";
import Resizable from "react-resizable-layout";

export default function Middle(): ReactElement {
    return (
        <div className="flex flex-col flex-grow h-max">
            
            <Playlist/>
            <Mpv/>
            <Log/>
        </div>
    )
}