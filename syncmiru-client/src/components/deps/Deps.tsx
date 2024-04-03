import {ReactElement, useEffect} from "react";
import {useTargetFamily} from "@hooks/useTargetFamily.ts";
import DepsMissingNoWindows from "@components/deps/DepsMissingNoWindows.tsx";
import DepsMissingWindows from "@components/deps/windows/DepsMissingWindows.tsx";
import {useLocation} from "wouter";
import {useHistoryState} from 'wouter/use-browser-location'
import {useDepsState} from "@hooks/useDepsState.ts";

export default function Deps(): ReactElement {
    const historyState = useHistoryState()
    const [_, navigate] = useLocation()
    const {firstRunSeen}: { firstRunSeen: boolean } = historyState;
    const {data: depsState} = useDepsState()
    const {data: targetFamily} = useTargetFamily()

    function navigateForward() {
        navigate("/login-dispatch")
    }

    useEffect(() => {
        if (depsState.mpv && depsState.yt_dlp)
            navigateForward()

    }, [depsState]);

    return (
        <>
        {targetFamily === "windows"
            ? <DepsMissingWindows firstRunSeen={firstRunSeen} depsState={depsState} />
            : <DepsMissingNoWindows firstRunSeen={firstRunSeen} depsState={depsState} />
        }
        </>
    )
}