import {ReactElement} from "react";
import Plus from "@components/svg/Plus.tsx";
import UploadCloud from "@components/svg/UploadCloud.tsx";
import CollapseRight from "@components/svg/CollapseRight.tsx";
import ExpandLeft from "@components/svg/ExpandLeft.tsx";
import BubbleCrossed from "@components/svg/BubbleCrossed.tsx";
import Bubble from "@components/svg/Bubble.tsx";
import SubtitlesCrossed from "@components/svg/SubtitlesCrossed.tsx";
import Eject from "@components/svg/Eject.tsx";
import DockBottom from "@components/svg/DockBottom.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import Server from "@components/svg/Server.tsx";
import UsersShowHideBtn from "@components/panel/UsersShowHideBtn.tsx";
import AddToPlaylistBtn from "@components/panel/AddToPlaylistBtn.tsx";
import AudioSyncBtn from "@components/panel/AudioSyncBtn.tsx";
import SubSyncBtn from "@components/panel/SubSyncBtn.tsx";
import ReadyBtn from "@components/panel/ReadyBtn.tsx";
import MpvWindowBtn from "@components/panel/MpvWindowBtn.tsx";
import SyncToMasterBtn from "@components/panel/SyncToMasterBtn.tsx";

export default function ButtonPanel(): ReactElement {
    return (
        <div className="flex items-center h-12 border-b gap-x-1">
            <AddToPlaylistBtn/>
            <AudioSyncBtn/>
            <SubSyncBtn/>
            <SyncToMasterBtn/>
            <div className="flex-1"></div>
            <MpvWindowBtn/>
            <ReadyBtn/>
            <UsersShowHideBtn/>
            {/*<Plus className="ml-2 h-7 w-min"/>*/}
            {/*<UploadCloud className="h-7 w-min"/>*/}
            {/*<Clickable className="p-2">*/}
            {/*    <Eject className="h-7 w-min"/>*/}
            {/*</Clickable>*/}
            {/*<DockBottom className="h-7 w-min"/>*/}
            {/*<CollapseRight className="h-7 w-min"/>*/}
            {/*<ExpandLeft className="h-7 w-min"/>*/}
            {/*<BubbleCrossed className="h-7 w-min"/>*/}
            {/*<Bubble className="h-7 w-min"/>*/}
            {/*<Subtitles className="h-7 w-min"/>*/}
            {/*<SubtitlesCrossed className="h-7 w-min"/>*/}
            {/*<Server className="h-7 w-min"/>*/}
        </div>
    )
}