import React, {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";

export default function Playlist(): ReactElement {
    const {playlistLoading} = useMainContext()

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
