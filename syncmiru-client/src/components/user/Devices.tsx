import {ReactElement, useEffect, useState} from "react";
import {Clickable, CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "../../utils/navigate.ts";
import {useLocation} from "wouter";
import Pc from "@components/svg/Pc.tsx";
import Delete from "@components/svg/Delete.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";

export default function Devices(): ReactElement {
    const [_, navigate] = useLocation()
    const {socket } = useMainContext()
    const [loading, setLoading] = useState<boolean>(true)
    const [activeSessionReceived, setActiveSessionReceived] = useState<boolean>(false)
    const [inactiveSessionReceived, setInactiveSessionReceived] = useState<boolean>(false)

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

    function onActiveSession(session: UserValue) {
        console.log("active session")
        console.log(JSON.stringify(session))
        setActiveSessionReceived(true)
    }

    function onInactiveSessions(...userSessions: Array<UserSession>) {
        console.log("inactive sessions")
        console.log(JSON.stringify(userSessions))
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
                    <p>Jakub-Desktop</p>
                    <p>・Windows</p>
                </div>
            </div>
            <div className="m-8">
                <h2 className="text-xl font-semibold">Další zařízení</h2>
                <div className="flex items-center mt-2">
                    <Pc className="w-8 mr-2"/>
                    <p>Jakub-Desktop</p>
                    <p>・Windows</p>
                    <div className="flex-1"></div>
                    <Clickable className="p-2">
                        <Delete className="w-8"/>
                    </Clickable>
                </div>
                <div className="flex items-center mt-2">
                    <Pc className="w-8 mr-2"/>
                    <p>Jakub-Desktop</p>
                    <p>・Windows</p>
                    <div className="flex-1"></div>
                    <Clickable className="p-2">
                        <Delete className="w-8"/>
                    </Clickable>
                </div>
                <div className="flex items-center mt-2">
                    <Pc className="w-8 mr-2"/>
                    <p>Jakub-Desktop</p>
                    <p>・Windows</p>
                    <div className="flex-1"></div>
                    <Clickable className="p-2">
                        <Delete className="w-8"/>
                    </Clickable>
                </div>
            </div>
        </div>
    )
}

interface UserSession {
    id: number,
    device_name: string
    os: string,
    last_access_at: string
}