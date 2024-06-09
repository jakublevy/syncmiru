import {ReactElement} from "react";
import DoorOut from "@components/svg/DoorOut.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useTranslation} from "react-i18next";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "../../utils/alert.ts";

export default function JoinedRoom(): ReactElement {
    const {
        socket,
        rooms,
        currentRid,
        setCurrentRid,
        roomConnecting
    } = useMainContext()
    const {t} = useTranslation()

    if(currentRid == null)
        return <></>

    const room = rooms.get(currentRid)
    const connectionMsg = roomConnecting
        ? t('room-connecting')
        : t('room-connected')

    function disconnectClicked() {
        socket!.emitWithAck("disconnect_room", {})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert("TODO error")
                }
                else {
                    setCurrentRid(null)
                }
            })
            .catch(() => {
                showPersistentErrorAlert("TODO error")
            })
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