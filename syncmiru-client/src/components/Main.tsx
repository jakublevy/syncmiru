import {ReactElement, useEffect, useRef, useState} from "react";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import Reconnecting from "@components/Reconnecting.tsx";
import SrvInfo from "@components/srv/SrvInfo.tsx";
import Rooms from "@components/rooms/Rooms.tsx";
import JoinedRoom from "@components/rooms/JoinedRoom.tsx";
import CurrentUser from "@components/user/CurrentUser.tsx";
import ButtonPanel from "@components/panel/ButtonPanel.tsx";
import Middle from "@components/Middle.tsx";
import {useJwt} from "@hooks/useJwt.tsx";
import {io, Socket} from "socket.io-client";
import {useHomeServer} from "@hooks/useHomeServer.ts";
import Users from "@components/user/Users.tsx";
import {MainContext} from "@hooks/useMainContext";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";
import Loading from "@components/Loading.tsx";
import UserSettings from "@components/user/UserSettings.tsx";
import useClearJwt from "@hooks/useClearJwt.ts";
import {LoginTkns} from "@models/login.ts";
import {useHwidHash} from "@hooks/useHwidHash.ts";
import {AvatarChange, DisplaynameChange, UserId, UserMap, UserSrv, UserValueClient} from "src/models/user.ts";
import {showPersistentErrorAlert, showPersistentWarningAlert} from "src/utils/alert.ts";
import {SOCKETIO_ACK_TIMEOUT_MS} from "src/utils/constants.ts";
import {arrayBufferToBase64} from "src/utils/encoding.ts";
import SrvSettings from "@components/srv/SrvSettings.tsx";
import {RoomId, RoomMap, RoomValue} from "@models/room.ts";
import RoomSettings from "@components/rooms/RoomSettings.tsx";
import {useUsersShown} from "@hooks/useUsersShown.ts";
import {useAudioSync} from "@hooks/useAudioSync.ts";
import {useSubSync} from "@hooks/useSubSync.ts";
import {RoomConnectionState} from "@models/context.ts";
import {UserRoomMap} from "@models/roomUser.ts";

export default function Main(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
    const jwt = useJwt();
    const hwidHash = useHwidHash()
    const clearJwt = useClearJwt()
    const homeSrv = useHomeServer();
    const usersShownInit = useUsersShown();
    const audioSyncInit = useAudioSync()
    const subSyncInit = useSubSync()
    const [socket, setSocket] = useState<Socket>();
    const [uid, setUid] = useState<number>(0)
    const [rooms, setRooms] = useState<RoomMap>(new Map<RoomId, RoomValue>())
    const [playlistLoading, setPlaylistLoading] = useState<boolean>(false)
    const [roomsLoading, setRoomsLoading] = useState<boolean>(false)
    const [reconnecting, setReconnecting] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(true)
    const [usersShown, setUsersShown] = useState<boolean>(true)
    const [audioSync, setAudioSync] = useState<boolean>(true)
    const [subSync, setSubSync] = useState<boolean>(true)
    const [ready, setReady] = useState<boolean>(false)
    const [currentRid, setCurrentRid] = useState<RoomId | null>(null)
    const [roomUsers, setRoomUsers] = useState<UserRoomMap>(new Map<RoomId, Set<UserId>>())
    const [roomConnection, setRoomConnection] = useState<RoomConnectionState>(RoomConnectionState.Established)
    const reconnectingRef = useRef<boolean>(false);

    const [users, setUsers]
        = useState<UserMap>(new Map<UserId, UserValueClient>());

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
        setSocket(s)

        s.emitWithAck("get_users")
            .then((users: Array<UserSrv>) => {
                setUsersFromSrv(users)
            })
            .catch(() => {
                navigateToLoginFormMain(navigate)
            })

        s.emitWithAck("get_me")
            .then((me: UserId) => {
                setUid(me)
            })
            .catch(() => {
                navigateToLoginFormMain(navigate)
            })

        return () => {
            s.disconnect()
        };
    }, []);

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('displayname_change', onDisplaynameChange)
            socket.on('avatar_change', onAvatarChange)
            socket.on("del_users", onDelUsers);
        }
    }, [socket, users]);

    useEffect(() => {
        reconnectingRef.current = reconnecting;
    }, [reconnecting]);

    useEffect(() => {
        setUsersShown(usersShownInit)
    }, [usersShownInit]);

    useEffect(() => {
        setAudioSync(audioSyncInit)
    }, [audioSyncInit]);

    useEffect(() => {
        setSubSync(subSyncInit)
    }, [subSyncInit]);

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

    function onUsers(user: UserSrv) {
        setUsersFromSrv([user])
    }

    function setUsersFromSrv(users: Array<UserSrv>) {
        let m: UserMap = new Map<UserId, UserValueClient>();
        for (const user of users)
            m.set(user.id, {
                username: user.username,
                displayname: user.displayname,
                avatar: arrayBufferToBase64(user.avatar),
                verified: user.verified
            })

        setUsers((p) => new Map<UserId, UserValueClient>([...p, ...m]))
        setLoading(false)
    }

    function onDelUsers(delUids: Array<UserId>) {
        let m: UserMap = new Map<UserId, UserValueClient>();
        for (const [id, user] of users) {
            if (!delUids.includes(id))
                m.set(id, user)
        }
        setUsers(m)
    }

    function onNewLogin() {
        showPersistentWarningAlert(t('login-on-another-device'))
        navigateToLoginFormMain(navigate)
    }

    function onDisplaynameChange(payload: DisplaynameChange) {
        let user = users.get(payload.uid)
        if (user === undefined)
            return;

        user.displayname = payload.displayname;
        const m = new Map<UserId, UserValueClient>();
        m.set(payload.uid, user);
        setUsers((p) => new Map<UserId, UserValueClient>([...p, ...m]))
    }

    function onAvatarChange(payload: AvatarChange) {
        let user = users.get(payload.uid)
        if (user === undefined)
            return;

        user.avatar = arrayBufferToBase64(payload.avatar)
        const m = new Map<UserId, UserValueClient>();
        m.set(payload.uid, user)
        setUsers((p) => new Map<UserId, UserValueClient>([...p, ...m]))
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

    function showSrvSettings() {
        return location.startsWith("/main/srv-settings") && shouldRender()
    }

    function showRoomSettings() {
        return location.startsWith("/main/room-settings") && shouldRender()
    }

    return (
        <>
            {reconnecting && <Reconnecting/>}
            {loading && <Loading/>}
            <MainContext.Provider
                value={{
                    socket: socket,
                    users: users,
                    uid: uid,
                    reconnecting: reconnecting,
                    playlistLoading: playlistLoading,
                    setPlaylistLoading: setPlaylistLoading,
                    rooms: rooms,
                    setRooms: setRooms,
                    roomsLoading: roomsLoading,
                    setRoomsLoading: setRoomsLoading,
                    usersShown: usersShown,
                    setUsersShown: setUsersShown,
                    audioSync: audioSync,
                    setAudioSync: setAudioSync,
                    subSync: subSync,
                    setSubSync: setSubSync,
                    ready: ready,
                    setReady: setReady,
                    currentRid: currentRid,
                    setCurrentRid: setCurrentRid,
                    roomConnection: roomConnection,
                    setRoomConnection: setRoomConnection,
                    roomUsers: roomUsers,
                    setRoomUsers: setRoomUsers
                }}>
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

                    {usersShown && <div className="border-t min-w-60 w-60">
                        <Users/>
                    </div>}
                </div>
                {showUserSettings() && <UserSettings/>}
                {showSrvSettings() && <SrvSettings/>}
                {showRoomSettings() && <RoomSettings/>}
            </MainContext.Provider>
        </>
    )
}