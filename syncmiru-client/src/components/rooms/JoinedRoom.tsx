import {ReactElement} from "react";
import DoorOut from "@components/svg/DoorOut.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useTranslation} from "react-i18next";

export default function JoinedRoom(): ReactElement {
    const {rooms, currentRid, roomConnecting} = useMainContext()
    const {t} = useTranslation()

    if(currentRid == null)
        return <></>

    const room = rooms.get(currentRid)
    const connectionMsg = roomConnecting
        ? t('room-connecting')
        : t('room-connected')

    function disconnectClicked() {

    }

    if(room == null)
        return <></>

    return (
        <div className="flex justify-between items-center border-l border-t p-2">
            <div className="flex flex-col">
                <p className="text-xs">{connectionMsg}</p>
                <p>{room.name}</p>
            </div>
            <Clickable
                className="p-2"
                onClick={disconnectClicked}
                disabled={roomConnecting}
            >
                <DoorOut className="w-7"/>
            </Clickable>
        </div>
    )
}