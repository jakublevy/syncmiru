import React, {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Clickable} from "@components/widgets/Button.tsx";
import SubtitlesCrossed from "@components/svg/SubtitlesCrossed.tsx";
import {useChangeSubSync} from "@hooks/useSubSync.ts";
import SubtitlesSync from "@components/svg/SubtitlesSync.tsx";

export default function SubSyncBtn(): ReactElement {
    const ctx = useMainContext()
    const changeSubSync = useChangeSubSync()

    function subSyncToggle() {
        changeSubSync(!ctx.subSync).then(() => {
            ctx.setSubSync(!ctx.subSync)
        })
    }

    return (
        <Clickable className="p-2" onClick={subSyncToggle}>
            {ctx.subSync
                ? <SubtitlesSync className="h-7"/>
                : <SubtitlesCrossed className="h-7"/>
            }
        </Clickable>
    )
}