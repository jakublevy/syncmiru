// @ts-ignore
import {ReactElement, use} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {depsStatePromise} from "../hooks/useDepsState.ts";
import {DepsState} from "../models/config.tsx";

export default function Deps(): ReactElement {
    const navigate = useNavigate()
    const { state } = useLocation()
    const { firstRunSeen } = state
    //const depsState: DepsState = use(depsStatePromise())
    return (
        <>
            <button onClick={() => navigate("/welcome")}>Back</button>
            <div>firstRunSeen: {String(firstRunSeen)}</div>
            {/*<div>mpv: {String(depsState.mpv)}</div>*/}
            {/*<div>yt-dlp: {String(depsState.yt_dlp)}</div>*/}
        </>
    )
}