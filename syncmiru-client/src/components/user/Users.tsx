import React, {ReactElement, useEffect, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import {UserId, UserSrv, UserValueClient} from "@models/user.ts";
import Avatar from "@components/widgets/Avatar.tsx";
import '../../rc-tooltip.css'
import Tooltip from "rc-tooltip";
import {Clickable} from "@components/widgets/Button.tsx";
import {SearchInput} from "@components/widgets/Input.tsx";
import {useTranslation} from "react-i18next";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";

export default function Users(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
    const {socket, users} = useMainContext()
    const [onlineUsers, setOnlineUsers]
        = useState<Array<UserValueClient>>(new Array<UserValueClient>())
    const [offlineUsers, setOfflineUsers]
        = useState<Array<UserValueClient>>(new Array<UserValueClient>())
    const [onlineUids, setOnlineUids] = useState<Array<UserId>>(new Array<UserId>());
    const [clickedOnlineIdx, setClickedOnlineIdx] = useState<number>(-1)
    const [clickedOfflineIdx, setClickedOfflineIdx] = useState<number>(-1)

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
            socket.on('offline', onOffline)

            socket.emitWithAck("get_online")
                .then((uids: Array<UserId>) => {
                    setOnlineUids((p) => [...p, ...uids])
                })
                .catch(() => {
                    navigateToLoginFormMain(navigate)
                })
        }
    }, [socket]);

    useEffect(() => {
        let on: Array<UserValueClient> = new Array<UserValueClient>();
        let off: Array<UserValueClient> = new Array<UserValueClient>();
        for (const uid of users.keys()) {
            if(!users.get(uid)?.verified)
                continue

            if (onlineUids.includes(uid)) {
                on.push(users.get(uid) as UserValueClient);
            } else {
                off.push(users.get(uid) as UserValueClient);
            }
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
    }

    function tooltipOnlineVisibilityChanged(visible: boolean, idx: number) {
        if(!visible)
            setClickedOnlineIdx(-1)
        else
            setClickedOnlineIdx(idx)
    }

    function tooltipOfflineVisibilityChanged(visible: boolean, idx: number) {
        if(!visible)
            setClickedOfflineIdx(-1)
        else
            setClickedOfflineIdx(idx)
    }

    return (
        <div className="flex flex-col overflow-auto h-dvh -mt-1">
            <SearchInput className="mt-3 ml-3 mr-3" value={searchValue} setValue={setSearchValue}/>
            {onlineUsersFiltered.length === 0 && offlineUsersFiltered.length === 0
                && <p className="text-center mt-4">{t('users-no-user-exists-filter')}</p>}
            {onlineUsersFiltered.length > 0 && <p className="text-xs pt-4 pl-4 pb-1">Online ({onlineUsersFiltered.length})</p>}
            {onlineUsersFiltered.map((u, i) => {
                return (
                    <Tooltip onVisibleChange={(e) => tooltipOnlineVisibilityChanged(e, i)}
                             key={i}
                             placement="bottom"
                             trigger={['click']}
                             overlay={
                        <div key={`${i}`} className="flex items-center w-[12.3rem]">
                            <Avatar key={`${i}_avatar`} className="min-w-20 w-20 mr-3" picBase64={u.avatar}/>
                            <div key={`${i}_flex`} className="flex flex-col items-start justify-center">
                                <p key={`${i}_displayname`}
                                   className="break-words max-w-[7.1rem] text-xl">{u.displayname}</p>
                                <p key={`${i}_username`} className="text-sm -mt-1">{u.username}</p>
                            </div>
                        </div>
                    }>
                        <a href="#">
                            <div key={`${i}_flex`} className="flex items-center">
                                <Clickable key={`${i}_clickable`}
                                           className={`p-1 pl-3 ml-1 mr-1 mtext-left flex items-center w-full text-left ${i === clickedOnlineIdx ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                                    <Avatar className="min-w-10 w-10 mr-2" key={`${i}_avatar`}
                                            picBase64={u.avatar}/>
                                    <p className="break-words max-w-[10.4rem]"
                                       key={`${i}_displayname`}>{u.displayname}</p>
                                </Clickable>
                            </div>
                        </a>
                    </Tooltip>
                )
            })}

            {offlineUsersFiltered.length > 0 && <p className="text-xs pt-4 pl-4 pb-1">Offline ({offlineUsersFiltered.length})</p>}
            {offlineUsersFiltered.map((u, i) => {
                return (
                    <Tooltip onVisibleChange={(e) => tooltipOfflineVisibilityChanged(e, i)}
                             key={i}
                             placement="bottom"
                             trigger={['click']}
                             overlay={
                                 <div key={`${i}`} className="flex items-center w-[12.3rem]">
                                     <Avatar key={`${i}_avatar`} className="min-w-20 w-20 mr-3" picBase64={u.avatar}/>
                                     <div key={`${i}_flex`} className="flex flex-col items-start justify-center">
                                         <p key={`${i}_displayname`}
                                            className="break-words max-w-[7.1rem] text-xl">{u.displayname}</p>
                                         <p key={`${i}_username`} className="text-sm -mt-1">{u.username}</p>
                                     </div>
                                 </div>
                             }>
                        <a href="#">
                            <div key={`${i}_flex`} className="flex items-center">
                                <Clickable key={`${i}_clickable`}
                                           className={`p-1 pl-3 ml-1 mr-1 mtext-left flex items-center w-full text-left ${i === clickedOfflineIdx ? 'bg-gray-100 dark:bg-gray-700' : 'opacity-30 hover:opacity-100'}`}>
                                    <Avatar className="min-w-10 w-10 mr-2" key={`${i}_avatar`}
                                            picBase64={u.avatar}/>
                                    <p className="break-words max-w-[10.4rem]"
                                       key={`${i}_displayname`}>{u.displayname}</p>
                                </Clickable>
                            </div>
                        </a>
                    </Tooltip>
                )
            })}
        </div>
    )
}