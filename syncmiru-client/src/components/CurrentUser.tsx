import React, {ReactElement, useEffect, useState} from "react";
import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {SvgBtn} from "@components/widgets/Button.tsx";
import Settings from "@components/svg/Settings.tsx";
import Loading from "@components/Loading.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function CurrentUser(): ReactElement {
    const {socket, users} = useMainContext()
    const [myUid, setMyUid] = useState<number>();

    useEffect(() => {
        if(socket !== undefined)
            socket.on('me', onMe)
    }, [socket]);

    function onMe(uid: UserId) {
        setMyUid(uid)
    }

    if (myUid !== undefined && users.get(myUid) !== undefined) {
        const user = users.get(myUid) as UserValue
        return (
            <div className="flex justify-between items-center p-2 h-16">
                <div className="flex">
                    <DefaultAvatar className="w-12 rounded-full mr-3"/>
                    <div className="flex flex-col items-start justify-center">
                        <p>{user.displayname}</p>
                        <p className="text-xs -mt-1">{user.username}</p>
                    </div>
                </div>
                <SvgBtn className="p-3" onClick={() => {
                }}>
                    <Settings className="h-6"/>
                </SvgBtn>
            </div>
        )
    }
    return <Loading/>
}