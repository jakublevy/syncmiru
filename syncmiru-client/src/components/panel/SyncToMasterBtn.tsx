import {ReactElement} from "react";
import {Clickable} from "@components/widgets/Button.tsx";
import UploadCloud from "@components/svg/UploadCloud.tsx";

export default function SyncToMasterBtn(): ReactElement {
    return (
        <Clickable className="p-2">
            <UploadCloud className="h-7"/>
        </Clickable>
    )
}