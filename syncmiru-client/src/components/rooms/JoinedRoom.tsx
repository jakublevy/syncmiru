import {ReactElement} from "react";
import DoorOut from "@components/svg/DoorOut.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useTranslation} from "react-i18next";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {RoomConnectionState} from "@models/context.ts";
import {UserId} from "@models/user.ts";

export default function JoinedRoom(): ReactElement {
    const {
        socket,
        rooms,
        currentRid,
        setCurrentRid,
        roomConnection,
        setRoomConnection,
        roomPingTimer,
        setUidPing
    } = useMainContext()
    const {t} = useTranslation()

    if(currentRid == null)
        return <></>

    const room = rooms.get(currentRid)
    const connectionMsg = roomConnection === RoomConnectionState.Connecting
        ? t('room-connecting')
        : roomConnection === RoomConnectionState.Disconnecting
            ? t('room-disconnecting')
            : t('room-connected')

    function disconnectClicked() {
        setRoomConnection(RoomConnectionState.Disconnecting)
        socket!.emitWithAck("disconnect_room", {})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('room-leave-failed'))
                }
                else {
                    clearInterval(roomPingTimer)
                    setUidPing(new Map<UserId, number>())
                    setCurrentRid(null)
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('room-leave-failed'))
                setRoomConnection(RoomConnectionState.Established)
            })
            .finally(() => {
                setRoomConnection(RoomConnectionState.Established)
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
                disabled={[RoomConnectionState.Connecting, RoomConnectionState.Disconnecting].includes(roomConnection)}
            >
                <DoorOut className="w-7"/>
            </Clickable>
        </div>
    )
}