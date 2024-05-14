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
import useClearJwt from "@hooks/useClearJwt.ts";
import {LoginTkns} from "@models/login.ts";
import {useHwidHash} from "@hooks/useHwidHash.ts";
import {AvatarChange, DisplaynameChange, UserClient, UserId, UserSrv, UserValueClient} from "src/models/user.ts";
import {showPersistentErrorAlert, showPersistentWarningAlert} from "src/utils/alert.ts";
import {SOCKETIO_ACK_TIMEOUT_MS} from "src/utils/constants.ts";
import {arrayBufferToBase64} from "src/utils/encoding.ts";
import {UserContext} from "@hooks/useUserContext.ts";

export default function Main(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
    const jwt = useJwt();
    const hwidHash = useHwidHash()
    const clearJwt = useClearJwt()
    const homeSrv = useHomeServer();
    const [socket, setSocket] = useState<Socket>();
    const [uid, setUid] = useState<number>(0)
    const [reconnecting, setReconnecting] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const reconnectingRef = useRef<boolean>(false);

    const [users, setUsers]
        = useState<Map<UserId, UserValueClient>>(new Map<UserId, UserValueClient>());

    useEffect(() => {
        const s = io(homeSrv, {
            auth: {jwt: jwt, hwid_hash: hwidHash} as LoginTkns,
            ackTimeout: SOCKETIO_ACK_TIMEOUT_MS
            },
        )
        s.on('connect_error', ioConnError)
        s.on('connect', ioConn)
        s.on('disconnect', ioDisconnect)
        s.on('users', onUsers)
        s.on('new_login', onNewLogin)
        s.on('displayname_change', onDisplaynameChange)
        s.on('avatar_change', onAvatarChange)
        s.on('me', onMe)
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
                showPersistentErrorAlert(t('login-jwt-invalid'))
                navigateToLoginFormMain(navigate)
            })
        } else if (!reconnectingRef.current) {
            showPersistentErrorAlert(t('login-failed'))
            navigateToLoginFormMain(navigate)
        }
    }

    function onUsers(users: Array<UserSrv>) {
        let m: Map<UserId, UserValueClient> = new Map<UserId, UserValueClient>();
        for (const user of users)
            m.set(user.id, {username: user.username, displayname: user.displayname, avatar: arrayBufferToBase64(user.avatar)})

        setUsers((p) => new Map<UserId, UserValueClient>([...p, ...m]))
        setLoading(false)
    }

    function onNewLogin() {
        showPersistentWarningAlert(t('login-on-another-device'))
        navigateToLoginFormMain(navigate)
    }

    function onDisplaynameChange(payload: DisplaynameChange) {
        let user = users.get(payload.uid)
        if(user === undefined)
            return;

        user.displayname = payload.displayname;
        const m = new Map<UserId, UserValueClient>();
        m.set(payload.uid, user);
        setUsers((p) => new Map<UserId, UserValueClient>([...p, ...m]))
    }

    function onAvatarChange(payload: AvatarChange) {
        let user = users.get(payload.uid)
        if(user === undefined)
            return;

        user.avatar = arrayBufferToBase64(payload.avatar)
        const m = new Map<UserId, UserValueClient>();
        m.set(payload.uid, user)
        setUsers((p) => new Map<UserId, UserValueClient>([...p, ...m]))
    }

    function onMe(uid: UserId) {
        setUid(uid)
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
            <MainContext.Provider value={{socket: socket, uid: uid}}>
                <UserContext.Provider value={{users: users}}>
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
                {showUserSettings() && <UserSettings/>}
                </UserContext.Provider>
            </MainContext.Provider>
        </>
    )
}