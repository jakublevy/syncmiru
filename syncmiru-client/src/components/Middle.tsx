import React, {ReactElement} from "react";
import Log from "@components/Log.tsx";
import Mpv from "@components/Mpv.tsx";
import Playlist from "@components/Playlist.tsx";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";

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
                <PanelResizeHandle className="my-1 h-2 bg-slate-300 dark:bg-slate-400"/>
                <Panel
                    className=""
                    defaultSize={25}
                    minSize={20}
                >
                    <Mpv/>
                </Panel>
            </PanelGroup>
            <Log/>
            {/*<PanelGroup direction="vertical">*/}
            {/*    <Panel defaultSize={25}>*/}
            {/*        <Playlist/>*/}
            {/*    </Panel>*/}
            {/*    <PanelResizeHandle className="mx-1 w-2 bg-slate-300">fd</PanelResizeHandle>*/}
            {/*    <Panel defaultSize={25}>*/}
            {/*        <Mpv/>*/}
            {/*    </Panel>*/}
            {/*</PanelGroup>*/}
            {/*<Log/>*/}
        </div>
    )
    {/*<Playlist/>*/
    }
    {/*<Mpv/>*/
    }
    {/*<Log/>*/
    }
    // <div className="flex flex-col flex-grow h-max">
    //     <Playlist/>
    //     <Mpv/>
    //     <Log/>
    // </div>
}