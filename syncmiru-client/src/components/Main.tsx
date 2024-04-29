import {ReactElement, useEffect, useRef, useState} from "react";
import {useLocation} from "wouter";
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
import Users from "@components/Users.tsx";
import {MainContext} from "@hooks/useMainContext";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";
import Loading from "@components/Loading.tsx";
import UserSettings from "@components/user/UserSettings.tsx";
import {StatusAlertService} from "react-status-alert";
import useClearJwt from "@hooks/useClearJwt.ts";
import {LoginTkns} from "@models/login.ts";
import {useHwidHash} from "@hooks/useHwidHash.ts";

export default function Main(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
    const jwt = useJwt();
    const hwidHash = useHwidHash()
    const clearJwt = useClearJwt()
    const homeSrv = useHomeServer();
    const [socket, setSocket] = useState<Socket>();
    const [reconnecting, setReconnecting] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const reconnectingRef = useRef<boolean>(false);

    const [users, setUsers]
        = useState<Map<UserId, UserValue>>(new Map<UserId, UserValue>());

    useEffect(() => {
        const s = io(homeSrv, {auth: {jwt: jwt, hwid_hash: hwidHash} as LoginTkns})
        s.on('connect_error', ioConnError)
        s.on('connect', ioConn)
        s.on('disconnect', ioDisconnect)
        s.on('users', onUsers)
        s.on('new-login', onNewLogin)
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
            clearJwt().then(() => {
                StatusAlertService.showError(t('login-jwt-invalid'))
                navigateToLoginFormMain(navigate)
            })
        } else if (!reconnectingRef.current) {
            StatusAlertService.showError(t('login-failed'))
            navigateToLoginFormMain(navigate)
        }
    }

    function onUsers(...users: Array<User>) {
        let m: Map<UserId, UserValue> = new Map<UserId, UserValue>();
        for (const user of users)
            m.set(user.id, {username: user.username, displayname: user.displayname, avatar: user.avatar})

        setUsers((p) => new Map<UserId, UserValue>([...p, ...m]))
        setLoading(false)
    }

    function onNewLogin() {
        StatusAlertService.showWarning(t('login-on-another-device'))
        navigateToLoginFormMain(navigate)
    }

    function shouldRender() {
        return !reconnecting && !loading
    }

    function showMainContent() {
        return location === "/main/index" && shouldRender()
    }

    function showUserSettings() {
        return location.startsWith("/main/user-settings") && shouldRender()
    }

    return (
        <>
            {reconnecting && <Reconnecting/>}
            {loading && <Loading/>}
            <MainContext.Provider value={{socket: socket, users: users}}>
                <div className={`flex w-dvw ${showMainContent() ? '' : 'hidden'}`}>
                    <div className="flex flex-col min-w-60 w-60 h-dvh">
                        <SrvInfo homeSrv={homeSrv}/>
                        <Rooms/>
                        <JoinedRoom/>
                        <CurrentUser/>
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
            {showUserSettings() && <UserSettings/>}
        </>
    )
}