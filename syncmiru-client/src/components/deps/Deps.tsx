import {ReactElement, useEffect} from "react";
import {DepsState} from "@models/config.tsx";
import {useDepsState} from "@hooks/useDepsState.ts";
import {useTargetFamily} from "@hooks/useTargetFamily.ts";
import DepsMissingNoWindows from "@components/deps/DepsMissingNoWindows.tsx";
import DepsMissingWindows from "@components/deps/windows/DepsMissingWindows.tsx";
import {useLocation} from "wouter";
import {useHistoryState} from 'wouter/use-browser-location'
import {DepsHistoryState} from "@models/historyState.ts";

export default function Deps(): ReactElement {
    const {firstRunSeen}: DepsHistoryState = useHistoryState()
    const [_, navigate] = useLocation()
    const depsState: DepsState = useDepsState()
    const targetFamily: string = useTargetFamily()

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