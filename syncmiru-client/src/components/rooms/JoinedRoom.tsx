import {ReactElement} from "react";
import DoorOut from "@components/svg/DoorOut.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useTranslation} from "react-i18next";
import {RoomConnectionState} from "@models/context.ts";
import {disconnectFromRoom} from "src/utils/room.ts";

export default function JoinedRoom(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()

    if(ctx.currentRid == null)
        return <></>

    const room = ctx.rooms.get(ctx.currentRid)
    const connectionMsg = ctx.roomConnection === RoomConnectionState.Connecting
        ? t('room-connecting')
        : ctx.roomConnection === RoomConnectionState.Disconnecting
            ? t('room-disconnecting')
            : t('room-connected')

    function disconnectClicked() {
        disconnectFromRoom(ctx, t)
    }

    if(room == null)
        return <></>

    return (
        <div className="flex justify-between items-center border-l border-t p-2">
            <div className="flex flex-col">
                <p className="text-xs">{connectionMsg}</p>
                <p className="truncate w-44">{room.name}</p>
            </div>
            <Clickable
                className="p-2"
                onClick={disconnectClicked}
                disabled={[RoomConnectionState.Connecting, RoomConnectionState.Disconnecting].includes(ctx.roomConnection)}
            >
                <DoorOut className="w-7"/>
            </Clickable>
        </div>
    )
}