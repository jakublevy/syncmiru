import {ReactElement} from "react";
import UsersShowHideBtn from "@components/panel/UsersShowHideBtn.tsx";
import AddToPlaylistBtn from "@components/panel/AddToPlaylistBtn.tsx";
import AudioSyncBtn from "@components/panel/AudioSyncBtn.tsx";
import SubSyncBtn from "@components/panel/SubSyncBtn.tsx";
import ReadyBtn from "@components/panel/ReadyBtn.tsx";
import MpvWindowBtn from "@components/panel/MpvWindowBtn.tsx";
import SyncToMasterBtn from "@components/panel/SyncToMasterBtn.tsx";
import MpvReloadBtn from "@components/panel/MpvReloadBtn.tsx";
import SpeedLabel from "@components/panel/SpeedLabel.tsx";

export default function ButtonPanel(): ReactElement {
    return (
        <div className="flex items-center h-12 border-b gap-x-1">
            <AddToPlaylistBtn/>
            <AudioSyncBtn/>
            <SubSyncBtn/>
            <SyncToMasterBtn/>
            <MpvReloadBtn/>
            <div className="flex-1"></div>
            <SpeedLabel/>
            <MpvWindowBtn/>
            <ReadyBtn/>
            <UsersShowHideBtn/>
        </div>
    )
}