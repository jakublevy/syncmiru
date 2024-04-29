import {ReactElement, useEffect, useState} from "react";
import {Clickable, CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "../../utils/navigate.ts";
import {useLocation} from "wouter";
import Pc from "@components/svg/Pc.tsx";
import Delete from "@components/svg/Delete.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {UserSession} from "src/models.ts";
import InactiveUserSessionsList from "@components/widgets/InactiveUserSessionsList.tsx";

export default function Devices(): ReactElement {
    const [_, navigate] = useLocation()
    const {socket } = useMainContext()
    const [loading, setLoading] = useState<boolean>(true)
    const [activeSessionReceived, setActiveSessionReceived] = useState<boolean>(false)
    const [inactiveSessionReceived, setInactiveSessionReceived] = useState<boolean>(false)
    const [activeSession, setActiveSession]
        = useState<UserSession>({device_name: '', last_access_at: '', os: '', id: 0})
    const [inactiveSessions, setInactiveSessions] = useState<Array<UserSession>>([])

    useEffect(() => {
        if(socket !== undefined) {
            socket.on('active_session', onActiveSession)
            socket.on('inactive_sessions', onInactiveSessions)
            socket.emit("get_user_sessions")
        }
    }, [socket]);

    useEffect(() => {
        if(activeSessionReceived && inactiveSessionReceived)
            setLoading(false)
    }, [activeSessionReceived, inactiveSessionReceived]);

    function onActiveSession(session: UserSession) {
        setActiveSession(session)
        setActiveSessionReceived(true)
    }

    function onInactiveSessions(userSessions: Array<UserSession>) {
        setInactiveSessions(userSessions)
        setInactiveSessionReceived(true)
    }

    if(loading)
        return (
            <div className="flex justify-center items-center h-full">
                <Loading/>
            </div>
        )

    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">Zařízení</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
            <div className="m-8">
                <h2 className="text-xl font-semibold">Aktuální zařízení</h2>
                <div className="flex mt-4">
                    <Pc className="w-8 mr-2"/>
                    <p>{activeSession.device_name}</p>
                    <p>・{activeSession.os}</p>
                </div>
            </div>
            {inactiveSessions.length > 0 &&
                <div className="m-8">
                <h2 className="text-xl font-semibold">Další zařízení</h2>
                <InactiveUserSessionsList sessions={inactiveSessions}/>
            </div>}
        </div>
    )
}
