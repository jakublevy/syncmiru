import {ReactElement, useEffect} from "react";
import {useLocation} from "wouter";
import {useHistoryState} from 'wouter/use-browser-location'

export default function Trampoline(): ReactElement {
    const [_, navigate] = useLocation()
    const historyState = useHistoryState()

    useEffect(() => {
        let sendState = Object.assign({}, historyState)
        delete sendState['to']
        navigate(historyState.to, {state: sendState})
    }, [navigate]);

    return <></>
}