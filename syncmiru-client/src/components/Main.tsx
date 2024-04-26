import {ReactElement, useEffect, useRef, useState} from "react";
import {useLocation} from "wouter";
import {showErrorAlert, showWarningAlert} from "src/utils/alert.ts";
import {useTranslation} from "react-i18next";
import Reconnecting from "@components/Reconnecting.tsx";
import SrvInfo from "@components/SrvInfo.tsx";
import Rooms from "@components/Rooms.tsx";
import JoinedRoom from "@components/JoinedRoom.tsx";
import CurrentUser from "@components/CurrentUser.tsx";
import ButtonPanel from "@components/ButtonPanel.tsx";
import Middle from "@components/Middle.tsx";
import {useJwt} from "@hooks/useJwt.tsx";
import {io, Socket} from "socket.io-client";
import {useHomeServer} from "@hooks/useHomeServer.ts";
import {invoke} from "@tauri-apps/api/core";
import Users from "@components/Users.tsx";
import { MainContext } from "@hooks/useMainContext";
import {navigateToLoginFormMain} from "../utils/navigate.ts";

export default function Main(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const jwt = useJwt();
    const homeSrv = useHomeServer();
    const [socket, setSocket] = useState<Socket>();
    const [reconnecting, setReconnecting] = useState<boolean>(false)
    const reconnectingRef = useRef<boolean>(false);

    const [users, setUsers]
        = useState<Map<UserId, UserValue>>(new Map<UserId, UserValue>());

    useEffect(() => {
        const s = io(homeSrv, {auth: {jwt: jwt}})
        s.on('connect_error', ioConnError)
        s.on('connect', ioConn)
        s.on('disconnect', ioDisconnect)
        s.on('users', onUsers)
        s.on('new-login' , onNewLogin)
        setSocket(s)
        return () => {
            s.disconnect()
        };
    }, []);

    useEffect(() => {
        reconnectingRef.current = reconnecting;
    }, [reconnecting]);


    function ioConn() {
        setReconnecting(false)
    }

    function ioDisconnect(reason: Socket.DisconnectReason) {
        setReconnecting(true)
    }

    function ioConnError(e: Error) {
        if (e.message === "Auth error") {
            invoke<void>('clear_jwt').then(() => {
                showErrorAlert(t('login-jwt-invalid'))
                navigateToLoginFormMain(navigate)
            })
        } else if (!reconnectingRef.current) {
            showErrorAlert(t('login-failed'))
            navigateToLoginFormMain(navigate)
        }
    }

    function onUsers(...users: Array<User>) {
        let m: Map<UserId, UserValue> = new Map<UserId, UserValue>();
        for (const user of users)
            m.set(user.id, {username: user.username, displayname: user.displayname, avatar: user.avatar})

        setUsers((p) => new Map<UserId, UserValue>([...p, ...m]))
    }

    function onNewLogin() {
        showWarningAlert("Byl jste přihlášen na jiném zařízení")
        navigateToLoginFormMain(navigate)
    }

    if (reconnecting)
        return <Reconnecting/>

    return (
        <MainContext.Provider value={{socket: socket, users: users}}>
            <div className="flex w-dvw">
                <div className="flex flex-col min-w-60 w-60 h-dvh">
                    <SrvInfo homeSrv={homeSrv}/>
                    <Rooms/>
                    <JoinedRoom/>
                    <CurrentUser />
                </div>
                <div className="border flex-1 min-w-60">
                    <div className="flex flex-col h-full">
                        <ButtonPanel/>
                        <Middle/>
                    </div>
                </div>
                <div className="border min-w-60 w-60">
                    <Users/>
                </div>
            </div>
        </MainContext.Provider>
    )
}