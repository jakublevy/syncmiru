import React, {ReactElement} from "react";
import Log from "@components/Log.tsx";
import Mpv from "@components/Mpv.tsx";
import Playlist from "@components/Playlist.tsx";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import ResizableIndicator from "@components/svg/ResizableIndicator.tsx";

export default function Middle(): ReactElement {
    return (
        <div className="flex flex-col flex-grow h-max">
            <PanelGroup direction="vertical">
                <Panel
                    defaultSize={25}
                    minSize={20}
                    style={{overflow: "auto"}}
                >
                    <Playlist/>
                </Panel>
                <PanelResizeHandle className="my-3 h-1 bg-slate-300 dark:bg-slate-400">
                    <div className="flex justify-center">
                        <ResizableIndicator className="w-[0.8rem] fill-slate-400 dark:fill-slate-300 -mt-2.5"/>
                    </div>
                </PanelResizeHandle>
                <Panel
                    className=""
                    defaultSize={25}
                    minSize={20}
                >
                    <Mpv/>
                </Panel>
            </PanelGroup>
            <Log/>
        </div>
    )
}