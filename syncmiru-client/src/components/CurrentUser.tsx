import {ReactElement, useEffect, useState} from "react";
import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {SvgBtn} from "@components/widgets/Button.tsx";
import Settings from "@components/svg/Settings.tsx";
import {Socket} from "socket.io-client";

export default function CurrentUser({socket, onReady}: Props): ReactElement {
    const [myProfile, setMyProfile] = useState<CurrentUser>()

    useEffect(() => {
        socket.on('my-profile', onMyProfile)
    }, [socket]);

    function onMyProfile(p: CurrentUser) {
        setMyProfile(p)
        onReady()
    }
    if (myProfile !== undefined)
        return (
            <div className="flex justify-between items-center p-2 h-16">
                <div className="flex">
                    <DefaultAvatar className="w-12 rounded-full mr-3"/>
                    <div className="flex flex-col items-start justify-center">
                        <p>{myProfile.displayname}</p>
                        <p className="text-xs -mt-1">{myProfile.username}</p>
                    </div>
                </div>
                <SvgBtn className="p-3" onClick={() => {
                }}>
                    <Settings className="h-6"/>
                </SvgBtn>
            </div>
        )
    return <></>
}

interface Props {
    socket: Socket,
    onReady: () => void
}