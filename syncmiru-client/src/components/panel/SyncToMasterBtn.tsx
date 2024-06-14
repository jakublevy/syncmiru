import {ReactElement} from "react";
import {Clickable} from "@components/widgets/Button.tsx";
import UploadCloud from "@components/svg/UploadCloud.tsx";

export default function SyncToMasterBtn(): ReactElement {
    return (
        <div className="flex items-center w-32">
            <Clickable className="p-2 ml-1">
                <UploadCloud className="h-7"/>
            </Clickable>
            <p className="ml-0.5 text-sm">A:4/S:2</p>
        </div>
    )
}