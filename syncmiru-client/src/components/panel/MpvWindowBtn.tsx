import {ReactElement} from "react";
import {BtnPrimary, Clickable} from "@components/widgets/Button.tsx";
import Eject from "@components/svg/Eject.tsx";
import {Tooltip} from "react-tooltip";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useIsSupportedWindowSystem} from "@hooks/useIsSupportedWindowSystem.ts";
import DockBottom from "@components/svg/DockBottom.tsx";

export default function MpvWindowBtn(): ReactElement {
    const {mpvWinDetached, setMpvWinDetached} = useMainContext()
    const isSupportedWindowSystem = useIsSupportedWindowSystem()
    const {t} = useTranslation()

    function mpvWindowBtnClicked() {
        setMpvWinDetached(!mpvWinDetached)
    }

    if (!isSupportedWindowSystem) {
        return (
            <div>
                <a data-tooltip-id="mpv-win-btn" data-tooltip-html={t('unsupported-window-system-tooltip')}>
                    <Clickable
                        className="p-2 ml-1"
                        disabled
                    >
                        <DockBottom className="h-7"/>
                    </Clickable>
                </a>
                <Tooltip
                    id="mpv-win-btn"
                    place="bottom"
                    openEvents={{mousedown: true, mouseenter: true}}
                    style={{color: "#eeeeee", backgroundColor: "#4338ca"}}/>
            </div>
        )
    }
    return (
        <Clickable
            className="p-2 ml-1"
            onClick={mpvWindowBtnClicked}
        >
            {mpvWinDetached
                ? <DockBottom className="h-7"/>
                : <Eject className="h-7"/>
            }
        </Clickable>
    )
}