import {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Clickable} from "@components/widgets/Button.tsx";
import Subtitles from "@components/svg/Subtitles.tsx";
import SubtitlesCrossed from "@components/svg/SubtitlesCrossed.tsx";
import {useChangeSubSync} from "@hooks/useSubSync.ts";

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
                ? <Subtitles className="h-7"/>
                : <SubtitlesCrossed className="h-7"/>
            }
        </Clickable>
    )
}