import {ReactElement} from "react";
import {Clickable} from "@components/widgets/Button.tsx";
import UploadCloud from "@components/svg/UploadCloud.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {Tooltip} from "react-tooltip";
import {useTranslation} from "react-i18next";

export default function UploadMyMpvState(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()

    const myReadyState = ctx.uid2ready.get(ctx.uid)

    function uploadMyMpvStateClicked() {

    }

    if(myReadyState != null && [UserReadyState.NotReady, UserReadyState.Ready].includes(myReadyState)) {
        return (
            <Clickable className="p-2" onClick={uploadMyMpvStateClicked}>
                <UploadCloud className="h-7"/>
            </Clickable>
        )
    }
    else {
        return (
            <div>
                <a data-tooltip-id="upload-my-mpv-state" data-tooltip-html={t('upload-mpv-state-tooltip')}>
                    <Clickable className="p-2" disabled>
                        <UploadCloud className="h-7"/>
                    </Clickable>
                </a>
                <Tooltip
                    id="upload-my-mpv-state"
                    place="bottom"
                    openEvents={{mousedown: true, mouseenter: true}}
                    style={{color: "#eeeeee", backgroundColor: "#4338ca"}}/>
            </div>
        )
    }
}