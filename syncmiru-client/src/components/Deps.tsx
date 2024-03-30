import {ReactElement, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {DepsState} from "../models/config.tsx";
import {useDepsState} from "../hooks/useDepsState.ts";
import {useTargetFamily} from "../hooks/useTargetFamily.ts";
import DepsMissingNoWindows from "./DepsMissingNoWindows.tsx";
import DepsMissingWindows from "./DepsMissingWindows.tsx";

export default function Deps(): ReactElement {
    const navigate = useNavigate()
    const {state} = useLocation()
    const {firstRunSeen}: { firstRunSeen: boolean } = state
    const depsState: DepsState = useDepsState()
    const targetFamily: string = useTargetFamily()

    function navigateForward() {
        navigate("/main")
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