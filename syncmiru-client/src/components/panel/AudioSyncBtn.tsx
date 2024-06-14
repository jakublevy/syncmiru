import {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Clickable} from "@components/widgets/Button.tsx";
import Bubble from "@components/svg/Bubble.tsx";
import BubbleCrossed from "@components/svg/BubbleCrossed.tsx";
import {useChangeAudioSync} from "@hooks/useAudioSync.ts";

export default function AudioSyncBtn(): ReactElement {
    const {audioSync, setAudioSync} = useMainContext()
    const changeAudioSync = useChangeAudioSync()

    function audioSyncToggle() {
        changeAudioSync(!audioSync).then(() => {
            setAudioSync(!audioSync)
        })
    }

    return (
        <Clickable className="p-2" onClick={audioSyncToggle}>
            {audioSync
                ? <Bubble className="h-7"/>
                : <BubbleCrossed className="h-7"/>
            }
        </Clickable>
    )
}