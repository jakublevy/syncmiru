import React, {ReactElement} from "react";
import {Clickable} from "@components/widgets/Button.tsx";
import Settings from "@components/svg/Settings.tsx";
import Loading from "@components/Loading.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useLocation} from "wouter";
import {UserValueClient} from "@models/user.ts";
import Avatar from "@components/widgets/Avatar.tsx";

export default function CurrentUser(): ReactElement {
    const [_, navigate] = useLocation()
    const {uid, users} = useMainContext()

    function userSettingsClicked() {
        navigate('/main/user-settings/account')
    }

    if (users.get(uid) !== undefined) {
        const user = users.get(uid) as UserValueClient
        return (
            <div className="flex justify-between items-center border-t p-2 h-16">
                <div className="flex items-center">
                    <Avatar className="min-w-12 w-12 mr-3" picBase64={user.avatar}/>
                    <div className="flex flex-col items-start justify-center">
                        <p className="break-words max-w-[7.2rem]">{user.displayname}</p>
                        <p className="text-xs -mt-1">{user.username}</p>
                    </div>
                </div>
                <Clickable className="p-3" onClick={userSettingsClicked}>
                    <Settings className="h-6"/>
                </Clickable>
            </div>
        )
    }
    return <Loading/>
}