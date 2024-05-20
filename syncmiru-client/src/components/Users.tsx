import React, {ReactElement, useEffect, useState} from "react";
import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {UserId, UserValueClient} from "src/models/user.ts";
import Avatar from "@components/widgets/Avatar.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import {Tooltip} from "react-tooltip";
import Question from "@components/svg/Question.tsx";
import ClickableTooltip from "@components/widgets/ClickableTooltip.tsx";
import useCSSTheme from "@hooks/useCSSTheme.ts";

export default function Users(): ReactElement {
    const {socket, users} = useMainContext()
    const [onlineUsers, setOnlineUsers]
        = useState<Array<UserValueClient>>(new Array<UserValueClient>())
    const [offlineUsers, setOfflineUsers]
        = useState<Array<UserValueClient>>(new Array<UserValueClient>())
    const [onlineUids, setOnlineUids] = useState<Array<UserId>>(new Array<UserId>());

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('online', onOnline)
            socket.on('offline', onOffline)
        }
    }, [socket]);

    useEffect(() => {
        let on: Array<UserValueClient> = new Array<UserValueClient>();
        let off: Array<UserValueClient> = new Array<UserValueClient>();
        for (const uid of users.keys()) {
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

    function onOnline(uids: Array<UserId>) {
        setOnlineUids((p) => [...p, ...uids])
    }

    function onOffline(uid: UserId) {
        setOnlineUids((p) => p.filter(x => x !== uid))
    }

    return (
        <div className="flex flex-col overflow-auto h-dvh -mt-1">
            {onlineUsers.length > 0 && <p className="text-xs pt-4 pl-4 pb-1">Online ({onlineUsers.length})</p>}
            {onlineUsers.map((u, i) => {
                return (
                    <div key={i}>
                        <a key={`${i}_info`} data-tooltip-id={`${i}_info`}>
                            <div key={`${i}_flex`} className="flex items-center">
                            <Clickable key={`${i}_clickable`} className="p-1 pl-3 ml-1 mr-1 mtext-left flex items-center w-full text-left">
                                    <Avatar className="min-w-10 w-10 mr-2" key={`${i}_avatar`} picBase64={u.avatar}/>
                                    <p className="break-words max-w-[10.4rem]"
                                       key={`${i}_displayname`}>{u.displayname}</p>
                            </Clickable>
                        </div>
                        </a>
                        <ClickableTooltip
                            key={`${i}_tooltip`}
                            id={`${i}_info`}
                            place="bottom"
                            render={(p) => {
                                return (
                                    <div key={`${i}`} className="flex items-center w-[12rem]">
                                        <Avatar key={`${i}_avatar`} className="min-w-20 w-20 mr-3" picBase64={u.avatar}/>
                                        <div key={`${i}_flex`} className="flex flex-col items-start justify-center">
                                            <p key={`${i}_displayname`} className="break-words max-w-[7.3rem] text-xl">{u.displayname}</p>
                                            <p key={`${i}_username`} className="text-sm -mt-1">{u.username}</p>
                                        </div>
                                    </div>
                                )
                            }}
                        />
                    </div>
                )
            })}

            {offlineUsers.length > 0 && <p className="text-xs pt-4 pl-4 pb-1">Offline ({offlineUsers.length})</p>}
            {offlineUsers.map((u, i) => {
                return (
                    <div
                        className="flex items-center p-1 pl-3 ml-1 mr-1 opacity-30 hover:bg-gray-300 dark:hover:bg-gray-600"
                        key={i}>
                        <Avatar className="min-w-10 w-10 mr-2" key={`${i}_avatar`} picBase64={u.avatar}/>
                        <p className="break-words max-w-[10.4rem]" key={`${i}_displayname`}>{u.displayname}</p>
                    </div>
                )
            })}
        </div>
    )
}