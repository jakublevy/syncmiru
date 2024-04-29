import {ReactElement, useEffect, useState, MouseEvent} from "react";
import {Clickable, CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import Pc from "@components/svg/Pc.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {UserSession, UserSessionStrTime} from "src/models.ts";
import Delete from "@components/svg/Delete.tsx";
import DateTimeLocalPretty from "@components/widgets/DateTimeLocalPretty.tsx";

export default function Devices(): ReactElement {
    const [_, navigate] = useLocation()
    const {socket } = useMainContext()
    const [loading, setLoading] = useState<boolean>(true)
    const [activeSessionReceived, setActiveSessionReceived] = useState<boolean>(false)
    const [inactiveSessionReceived, setInactiveSessionReceived] = useState<boolean>(false)
    const [activeSession, setActiveSession]
        = useState<UserSession>({device_name: '', last_access_at: new Date(), os: '', id: 0})
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

    function onActiveSession(sessionStrTime: UserSessionStrTime) {
        const {last_access_at, ...rest} = sessionStrTime
        setActiveSession({
            last_access_at: new Date(sessionStrTime.last_access_at),
            ...rest
        } as UserSession)
        setActiveSessionReceived(true)
    }

    function onInactiveSessions(sessionsStrTime: Array<UserSessionStrTime>) {
        const userSessions = sessionsStrTime.map(x => {
            return {
                device_name: x.device_name,
                os: x.os,
                id: x.id,
                last_access_at: new Date(x.last_access_at)
        } as UserSession})
        setInactiveSessions(userSessions)
        setInactiveSessionReceived(true)
    }

    if(loading)
        return (
            <div className="flex justify-center items-center h-full">
                <Loading/>
            </div>
        )

    function onSessionDelete(e: MouseEvent<HTMLButtonElement>) {
        console.log(e.currentTarget.id)
    }

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
                    {inactiveSessions
                        .sort((x,y) => y.last_access_at.getTime() - x.last_access_at.getTime())
                        .map((session => {
                        return (
                            <div className="flex items-center mt-2">
                                <Pc className="w-8 mr-2"/>
                                <div className="flex flex-col">
                                    <p>{session.device_name}・{session.os}</p>
                                    <p>naposledy aktivní: {<DateTimeLocalPretty datetime={session.last_access_at}/>}</p>
                                </div>
                                <div className="flex-1"></div>
                                <Clickable id={session.id.toString()} className="p-2" onClick={onSessionDelete}>
                                    <Delete className="w-8"/>
                                </Clickable>
                            </div>
                        )
                    }))}
                </div>}
        </div>
    )
}
