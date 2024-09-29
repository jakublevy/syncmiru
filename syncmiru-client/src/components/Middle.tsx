import React, {ReactElement, useRef, useState} from "react";
import Mpv from "@components/mpv/Mpv.tsx";
import Playlist from "@components/playlist/Playlist.tsx";
import {ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function Middle(): ReactElement {
    const {mpvWinDetached} = useMainContext()
    const [mpvResizeVar, setMpvResizeVar] = useState<boolean>(false)
    const mpvPanel = useRef<ImperativePanelHandle>(null)

    function onMpvResized(size: number) {
        if(mpvPanel != null) {
            setMpvResizeVar((p) => !p)
        }
    }

    return (
        <div className='flex flex-col flex-grow h-max'>
            <PanelGroup direction="vertical">
                <Panel
                    defaultSize={30}
                    minSize={27}
                    style={{overflow: "auto"}}
                >
                    <Playlist/>
                </Panel>
                <PanelResizeHandle className={`h-1 bg-slate-300 dark:bg-slate-400 group ${mpvWinDetached ? 'hidden' : ''}`}>
                    <div
                        className="flex justify-center invisible group-data-[resize-handle-state='hover']:visible group-data-[resize-handle-state='drag']:visible">
                        {/*<ResizableIndicator className="w-[0.8rem] fill-slate-400 dark:fill-slate-300 -mt-2.5"/>*/}
                    </div>
                </PanelResizeHandle>
                <Panel
                    ref={mpvPanel}
                    onResize={onMpvResized}
                    className={`${mpvWinDetached ? 'hidden' : ''}`}
                    defaultSize={50}
                    minSize={27}
                >
                    <Mpv
                        mpvResizeVar={mpvResizeVar}
                        setMpvResizeVar={setMpvResizeVar}
                    />
                </Panel>
            </PanelGroup>
        </div>
    )
}