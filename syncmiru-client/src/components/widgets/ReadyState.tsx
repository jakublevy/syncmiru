import React, {ReactElement} from "react";
import Check from "@components/svg/Check.tsx";
import Cross from "@components/svg/Cross.tsx";
import HourGlass from "@components/svg/HourGlass.tsx";
import Exclamation from "@components/svg/Exclamation.tsx";

export default function ReadyState({state, className}: Props): ReactElement {
    if(state === UserReadyState.Ready)
        return (
            <Check className={className}/>
        )
    if(state === UserReadyState.NotReady)
        return (
            <Cross className={className}/>
        )
    if(state === UserReadyState.Loading)
        return (
            <HourGlass className={className}/>
        )
    if(state === UserReadyState.Error)
        return (
            <Exclamation className={className}/>
        )
    return (
        <div className={className}></div>
    )
}

interface Props {
    state: UserReadyState
    className?: string
}

export enum UserReadyState {
    Ready = "Ready",
    NotReady = "NotReady",
    Loading = "Loading",
    Error = "Error"
}