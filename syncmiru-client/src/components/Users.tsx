import React, {ReactElement, useEffect, useState} from "react";
import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {UserId, UserValue} from "src/models.ts";

export default function Users(): ReactElement {
    const {socket, users} = useMainContext()
    const [onlineUsers, setOnlineUsers]
        = useState<Array<UserValue>>(new Array<UserValue>())
    const [offlineUsers, setOfflineUsers]
        = useState<Array<UserValue>>(new Array<UserValue>())
    const [onlineUids, setOnlineUids] = useState<Array<UserId>>(new Array<UserId>());

    useEffect(() => {
        if(socket !== undefined) {
            socket.on('online', onOnline)
            socket.on('offline', onOffline)
        }
    }, [socket]);

    useEffect(() => {
        let on: Array<UserValue> = new Array<UserValue>();
        let off: Array<UserValue> = new Array<UserValue>();
        for(const uid of users.keys()) {
            if(onlineUids.includes(uid)) {
                on.push(users.get(uid) as UserValue);
            }
            else {
                off.push(users.get(uid) as UserValue);
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
            {onlineUsers.length > 0 && <p className="text-xs pt-4 pl-4 pb-1">Online ({onlineUsers.length})</p> }
            {onlineUsers.map((u, i) => {
                return (
                    <div className="flex items-center p-1 pl-3 ml-1 mr-1 hover:bg-gray-100 dark:hover:bg-gray-700" key={i}>
                        <DefaultAvatar className="w-8 rounded-full mr-2" key={`${i}_avatar`}/>
                        <p key={`${i}_displayname`}>{u.displayname}</p>
                    </div>
                )
            })}

            {offlineUsers.length > 0 && <p className="text-xs pt-4 pl-4 pb-1">Offline ({offlineUsers.length})</p> }
            {offlineUsers.map((u, i) => {
                return (
                    <div className="flex items-center p-1 pl-3 ml-1 mr-1 opacity-30 hover:bg-gray-300 dark:hover:bg-gray-600" key={i}>
                        <DefaultAvatar className="w-8 rounded-full mr-2" key={`${i}_avatar`}/>
                        <p key={`${i}_displayname`}>{u.displayname}</p>
                    </div>
                )
            })}
        </div>
    )
}