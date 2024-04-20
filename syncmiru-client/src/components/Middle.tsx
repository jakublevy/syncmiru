import React, {ReactElement} from "react";
import Log from "@components/Log.tsx";
import Mpv from "@components/Mpv.tsx";
import Playlist from "@components/Playlist.tsx";
import Resizable from "react-resizable-layout";
import SampleSeparator from "@components/SampleSeparator.tsx";

export default function Middle(): ReactElement {
    return (
        <>
            <Resizable initial={100} axis="y">
                {({ position: y, separatorProps }) => (
                    <div className="flex flex-col flex-grow h-max">
                        <Playlist height={y}/>
                        <SampleSeparator id="splitter" dir="horizontal" {...separatorProps} />
                        <Mpv height={`calc(100% - ${y}px)`}/>
                    </div>
                )}
            </Resizable>
            <Log/>
        </>
        // <div className="flex flex-col flex-grow h-max">
        //     <Playlist/>
        //     <Mpv/>
        //     <Log/>
        // </div>
    )
}