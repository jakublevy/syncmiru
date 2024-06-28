import React, {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Clickable} from "@components/widgets/Button.tsx";
import SubtitlesCrossed from "@components/svg/SubtitlesCrossed.tsx";
import {useChangeSubSync} from "@hooks/useSubSync.ts";
import SubtitlesSync from "@components/svg/SubtitlesSync.tsx";

export default function SubSyncBtn(): ReactElement {
    const {subSync, setSubSync} = useMainContext()
    const changeSubSync = useChangeSubSync()

    function subSyncToggle() {
        changeSubSync(!subSync).then(() => {
            setSubSync(!subSync)
        })
    }

    return (
        <Clickable className="p-2" onClick={subSyncToggle}>
            {subSync
                ? <SubtitlesSync className="h-7"/>
                : <SubtitlesCrossed className="h-7"/>
            }
        </Clickable>
    )
}