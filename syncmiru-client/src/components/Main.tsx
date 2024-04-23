import {ReactElement, useEffect, useState} from "react";
import {useLocation} from "wouter";
import {showErrorAlert} from "src/utils/alert.ts";
import {useTranslation} from "react-i18next";
import Reconnecting from "@components/Reconnecting.tsx";
import SrvInfo from "@components/SrvInfo.tsx";
import Rooms from "@components/Rooms.tsx";
import JoinedRoom from "@components/JoinedRoom.tsx";
import CurrentUser from "@components/CurrentUser.tsx";
import ButtonPanel from "@components/ButtonPanel.tsx";
import Middle from "@components/Middle.tsx";
import Loading from "@components/Loading.tsx";
import {useJwt} from "@hooks/useJwt.tsx";
import {io, Socket} from "socket.io-client";
import {useHomeServer} from "@hooks/useHomeServer.ts";
import {invoke} from "@tauri-apps/api/core";

export default function Main(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const jwt = useJwt();
    const homeSrv= useHomeServer();
    const [socket, setSocket] = useState<Socket>();

    const [reconnecting, setReconnecting] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [currentUserReady, setCurrentUserReady] = useState(false)

    useEffect(() => {
        const s = io(homeSrv, {auth: {jwt: jwt}})
        s.on('connect_error', ioConnError)
        s.on('connect', ioConn)
        s.on('disconnect', ioDisconnect)
        setSocket(s)
        return () => { s.disconnect() };
    }, [jwt]);

    useEffect(() => {
        if(socket !== undefined) {
            for (let i = 0; i < 5; ++i)
                socket.emit('test')
        }
    }, [socket]);

    useEffect(() => {
        if(currentUserReady) {
            setLoading(false)
        }
    }, [currentUserReady]);

    function ioConn() {
        setReconnecting(false)
    }

    function ioDisconnect(reason: Socket.DisconnectReason) {
        setReconnecting(true)
        console.log('disconnected')
    }

    function ioConnError(e: Error) {
        if(e.message === "Auth error") {
            invoke<void>('clear_jwt').then(() => {
                showErrorAlert(t('login-jwt-invalid'))
                navigate('/login-form/main')
            })
        }
        else {
            showErrorAlert(t('login-failed'))
            navigate('/login-form/main')
        }
    }

    function onCurrentUserReady() {
        setCurrentUserReady(true)
    }

    if (reconnecting)
        return <Reconnecting/>

    if (loading)
        return <Loading/>

    if(socket !== undefined)
        return (
            <div className="flex w-dvw">
                <div className="flex flex-col min-w-60 w-60">
                    <SrvInfo homeSrv={homeSrv}/>
                    <Rooms/>
                    <JoinedRoom/>
                    <CurrentUser socket={socket} onReady={onCurrentUserReady}/>
                </div>
                <div className="border flex-1 min-w-60">
                    <div className="flex flex-col h-full">
                        <ButtonPanel/>
                        <Middle/>
                    </div>
                </div>
                <div className="border min-w-60 w-60">C3</div>
            </div>
        )
    return <></>
}