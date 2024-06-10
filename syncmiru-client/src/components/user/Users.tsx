import React, {ReactElement, useEffect, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {UserClient, UserId} from "@models/user.ts";
import Avatar from "@components/widgets/Avatar.tsx";
import 'src/rc-tooltip.css'
import {Clickable} from "@components/widgets/Button.tsx";
import {SearchInput} from "@components/widgets/Input.tsx";
import {useTranslation} from "react-i18next";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import Loading from "@components/Loading.tsx";
import UserInfoTooltip from "@components/widgets/UserInfoTooltip.tsx";
import {UserRoomMap} from "@models/roomUser.ts";
import {RoomId} from "@models/room.ts";
import {Simulate} from "react-dom/test-utils";

export default function Users(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const {
        socket,
        users,
        setRoomUsers,
        roomUidClicked,
        setRoomUidClicked
    } = useMainContext()
    const [usersLoading, setUsersLoading] = useState<boolean>(true)
    const [onlineUsers, setOnlineUsers]
        = useState<Array<UserClient>>(new Array<UserClient>())
    const [offlineUsers, setOfflineUsers]
        = useState<Array<UserClient>>(new Array<UserClient>())
    const [onlineUids, setOnlineUids] = useState<Array<UserId>>(new Array<UserId>());
    const [clickedUid, setClickedUid] = useState<UserId>(-1)

    const [searchValue, setSearchValue] = useState<string>("")
    const searchValueLC = searchValue.toLowerCase()

    const onlineUsersFiltered
        = onlineUsers.filter(x =>
        x.displayname.toLowerCase().includes(searchValueLC) || x.username.toLowerCase().includes(searchValueLC))

    const offlineUsersFiltered
        = offlineUsers.filter(x =>
        x.displayname.toLowerCase().includes(searchValueLC) || x.username.toLowerCase().includes(searchValueLC))

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('online', onOnline)

            socket.emitWithAck("get_online")
                .then((uids: Array<UserId>) => {
                    setOnlineUids((p) => [...p, ...uids])
                })
                .catch(() => {
                    navigateToLoginFormMain(navigate)
                })
                .finally(() => {
                    setUsersLoading(false)
                })
        }
    }, [socket]);

    useEffect(() => {
        if(socket !== undefined) {
            socket.on('offline', onOffline)
        }
    }, [socket, roomUidClicked]);

    useEffect(() => {
        let on: Array<UserClient> = new Array<UserClient>();
        let off: Array<UserClient> = new Array<UserClient>();
        for (const uid of users.keys()) {
            const userValue = users.get(uid)
            if (userValue == null || !userValue.verified)
                continue

            if (onlineUids.includes(uid))
                on.push({id: uid, ...userValue});
            else
                off.push({id: uid, ...userValue});
        }
        on = on.sort((a, b) => a.displayname.localeCompare(b.displayname))
        off = off.sort((a, b) => a.displayname.localeCompare(b.displayname))
        setOnlineUsers(on)
        setOfflineUsers(off)
    }, [users, onlineUids]);

    function onOnline(uid: UserId) {
        setOnlineUids((p) => [...p, uid])
    }

    function onOffline(uid: UserId) {
        setOnlineUids((p) => p.filter(x => x !== uid))

        if(uid === roomUidClicked)
            setRoomUidClicked(-1)

        setRoomUsers((p) => {
            const m: UserRoomMap = new Map<RoomId, Set<UserId>>()
            for(const [rid, uids] of p) {
                if(!uids.has(uid))
                    m.set(rid, uids)
                else {
                    uids.delete(uid)
                    m.set(rid, uids)
                }
            }
            return m
        })
    }

    function tooltipVisibilityChanged(visible: boolean, idx: number) {
        if (!visible)
            setClickedUid(-1)
        else
            setClickedUid(idx)
    }

    if (usersLoading)
        return (
            <div className="flex justify-center align-middle h-full">
                <Loading/>
            </div>
        )

    return (
        <div className="flex flex-col overflow-auto h-dvh -mt-1">
            <SearchInput className="mt-3 ml-3 mr-3" value={searchValue} setValue={setSearchValue}/>
            {onlineUsersFiltered.length === 0 && offlineUsersFiltered.length === 0
                && <p className="text-center mt-4">{t('users-no-user-exists-filter')}</p>}
            {onlineUsersFiltered.length > 0 &&
                <p className="text-xs pt-4 pl-4 pb-1">Online ({onlineUsersFiltered.length})</p>}
            {onlineUsersFiltered.map((u) => {
                return (
                    <UserInfoTooltip
                        key={u.id}
                        id={u.id}
                        visible={u.id === clickedUid}
                        content={
                            <div className="flex items-center">
                                <Clickable className={`p-1 pl-3 ml-1 mr-1 mtext-left flex items-center w-full text-left ${u.id === clickedUid ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                                    <Avatar className="min-w-10 w-10 mr-2"
                                            picBase64={u.avatar}/>
                                    <p className="break-words max-w-[10.4rem]">{u.displayname}</p>
                                </Clickable>
                            </div>
                        }
                        user={u}
                        tooltipOnlineVisibilityChanged={tooltipVisibilityChanged}
                    />
                )
            })}

            {offlineUsersFiltered.length > 0 &&
                <p className="text-xs pt-4 pl-4 pb-1">Offline ({offlineUsersFiltered.length})</p>}
            {offlineUsersFiltered.map((u) => {
                return (
                    <UserInfoTooltip
                        key={u.id}
                        id={u.id}
                        visible={u.id === clickedUid}
                        content={
                            <div className="flex items-center">
                                <Clickable className={`p-1 pl-3 ml-1 mr-1 mtext-left flex items-center w-full text-left ${u.id === clickedUid ? 'bg-gray-100 dark:bg-gray-700' : 'opacity-30 hover:opacity-100'}`}>
                                    <Avatar className="min-w-10 w-10 mr-2"
                                            picBase64={u.avatar}/>
                                    <p className="break-words max-w-[10.4rem]">{u.displayname}</p>
                                </Clickable>
                            </div>
                        }
                        user={u}
                        tooltipOnlineVisibilityChanged={tooltipVisibilityChanged}
                    />
                )
            })}
        </div>
    )
}