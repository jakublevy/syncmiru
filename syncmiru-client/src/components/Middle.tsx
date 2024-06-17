import React, {ReactElement} from "react";
import Mpv from "@components/Mpv.tsx";
import Playlist from "@components/playlist/Playlist.tsx";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import ResizableIndicator from "@components/svg/ResizableIndicator.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function Middle(): ReactElement {
    const {mpvWinDetached} = useMainContext()
    return (
        <div className='flex flex-col flex-grow h-max'>
            <PanelGroup direction="vertical">
                <Panel
                    defaultSize={30}
                    minSize={24}
                    style={{overflow: "auto"}}
                >
                    <Playlist/>
                </Panel>
                <PanelResizeHandle className={`h-1 bg-slate-300 dark:bg-slate-400 group ${mpvWinDetached ? 'hidden' : ''}`}>
                    <div
                        className="flex justify-center invisible group-data-[resize-handle-state='hover']:visible group-data-[resize-handle-state='drag']:visible">
                        <ResizableIndicator className="w-[0.8rem] fill-slate-400 dark:fill-slate-300 -mt-2.5"/>
                    </div>
                </PanelResizeHandle>
                <Panel
                    className={`${mpvWinDetached ? 'hidden' : ''}`}
                    defaultSize={50}
                    minSize={20}
                >
                    <Mpv/>
                </Panel>
            </PanelGroup>
        </div>
    )
}