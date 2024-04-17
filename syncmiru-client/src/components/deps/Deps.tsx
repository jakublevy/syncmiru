import {ReactElement, useEffect} from "react";
import {DepsState} from "@models/deps.tsx";
import {useDepsState} from "@hooks/useDepsState.ts";
import {useTargetFamily} from "@hooks/useTargetFamily.ts";
import DepsMissingNoWindows from "@components/deps/DepsMissingNoWindows.tsx";
import DepsMissingWindows from "@components/deps/windows/DepsMissingWindows.tsx";
import {useLocation} from "wouter";
import {useHistoryState} from 'wouter/use-browser-location'
import {DepsHistoryState} from "@models/historyState.ts";
import {mutate} from "swr";

export default function Deps(): ReactElement {
    const {firstRunSeen}: DepsHistoryState = useHistoryState()
    const [_, navigate] = useLocation()
    const depsState: DepsState = useDepsState()
    const targetFamily: string = useTargetFamily()

    function navigateToLogin() {
        navigate("/login-dispatch")
    }

    function navigateCheckDepsUpdates() {
        mutate('get_deps_versions_fetch', undefined).then(() =>
            navigate("/deps-update")
        )
    }

    useEffect(() => {
        if (depsState.mpv && depsState.yt_dlp) {
            if (depsState.managed)
                navigateCheckDepsUpdates()
            else
                navigateToLogin()
        }

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