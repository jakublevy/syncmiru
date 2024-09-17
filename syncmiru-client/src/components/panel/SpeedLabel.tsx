import {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function SpeedLabel(): ReactElement {
    const {reportedPlaybackSpeed} = useMainContext()
    if(reportedPlaybackSpeed != null) {
        return (
            <p className="text-sm">{reportedPlaybackSpeed.toFixed(2)}x</p>
        )
    }
    return <></>
}