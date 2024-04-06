import {ReactElement, useEffect} from "react";
import {useLocation} from "wouter";
import {useHistoryState} from 'wouter/use-browser-location'
import {TrampolineHistoryState} from "@models/historyState.ts";

export default function Trampoline(): ReactElement {
    const [_, navigate] = useLocation()
    const historyState: TrampolineHistoryState = useHistoryState()

    useEffect(() => {
        let sendState: any = Object.assign({}, historyState)
        delete sendState['to']
        navigate(historyState.to, {state: sendState})
    }, [navigate]);

    return <></>
}