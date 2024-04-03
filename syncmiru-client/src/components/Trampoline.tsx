import {ReactElement, useEffect} from "react";
import {useLocation} from "wouter";
import {useHistoryState} from 'wouter/use-browser-location'
import Loading from "@components/Loading.tsx";

export default function Trampoline(): ReactElement {
    const [_, navigate] = useLocation()
    const historyState = useHistoryState()

    useEffect(() => {
        let sendState = Object.assign({}, historyState)
        delete sendState['to']
        new Promise(r => setTimeout(r, 300)).then(() => navigate(historyState.to, {state: sendState}))
    }, [navigate]);

    return <Loading/>
}