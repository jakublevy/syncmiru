import React, {ReactElement} from "react";
import Mpv from "@components/Mpv.tsx";
import Playlist from "@components/Playlist.tsx";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import ResizableIndicator from "@components/svg/ResizableIndicator.tsx";

export default function Middle(): ReactElement {
    return (
        <div className="flex flex-col flex-grow h-max">
            <PanelGroup direction="vertical">
                <Panel
                    defaultSize={30}
                    minSize={20}
                    style={{overflow: "auto"}}
                >
                    <Playlist/>
                </Panel>
                <PanelResizeHandle className="h-1 bg-slate-300 dark:bg-slate-400 group">
                    <div className="flex justify-center">
                        <ResizableIndicator className="w-[0.8rem] fill-slate-400 dark:fill-slate-300 -mt-2.5 invisible group-hover:visible group-active:visible"/>
                    </div>
                </PanelResizeHandle>
                <Panel
                    defaultSize={50}
                    minSize={20}
                >
                    <Mpv/>
                </Panel>
            </PanelGroup>
        </div>
    )
}