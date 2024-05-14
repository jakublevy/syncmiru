import React, {ReactElement} from "react";
import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import Settings from "@components/svg/Settings.tsx";
import Loading from "@components/Loading.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useLocation} from "wouter";
import {UserId, UserValueClient} from "src/models/user.ts";
import {useUserContext} from "@hooks/useUserContext.ts";

export default function CurrentUser(): ReactElement {
    const [_, navigate] = useLocation()
    const {uid} = useMainContext()
    const {users} = useUserContext()

    function userSettingsClicked() {
        navigate('/main/user-settings/account')
    }

    if (users.get(uid) !== undefined) {
        const user = users.get(uid) as UserValueClient
        return (
            <div className="flex justify-between items-center p-2 h-16">
                <div className="flex">
                    <DefaultAvatar className="w-12 rounded-full mr-3"/>
                    <div className="flex flex-col items-start justify-center">
                        <p>{user.displayname}</p>
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