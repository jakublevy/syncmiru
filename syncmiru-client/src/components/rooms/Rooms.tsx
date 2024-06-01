import {ReactElement, useEffect} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {RoomId, RoomMap, RoomSrv, RoomValueClient} from "@models/room.ts";
import Decimal from "decimal.js";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "../../utils/alert.ts";
import Play from "@components/svg/Play.tsx";
import {Btn, Clickable} from "@components/widgets/Button.tsx";
import Settings from "@components/svg/Settings.tsx";
import {useTranslation} from "react-i18next";
import {useLocation, useRouter} from "wouter";
import {RoomSettingsHistoryState} from "@models/historyState.ts";

export default function Rooms(): ReactElement {
    const {
        socket,
        roomsLoading,
        setRoomsLoading,
        rooms,
        setRooms
    } = useMainContext()
    const {t} = useTranslation()
    const [_, navigate] = useLocation()

    useEffect(() => {
        if (socket !== undefined) {
            setRoomsLoading(true)
            socket.on('rooms', onRooms)

            socket.emitWithAck("get_rooms")
                .then((ack: SocketIoAck<Array<RoomSrv>>) => {
                    if (ack.status === SocketIoAckType.Err)
                        showPersistentErrorAlert(t('rooms-fetch-error'))
                    else
                        addRoomsFromSrv(ack.payload as Array<RoomSrv>)
                })
                .catch(() => {
                    showPersistentErrorAlert(t('rooms-fetch-error'))
                })
                .finally(() => {
                    setRoomsLoading(false)
                })
        }
    }, [socket]);

    function onRooms(rooms: Array<RoomSrv>) {
        addRoomsFromSrv(rooms)
    }

    function addRoomsFromSrv(rooms: Array<RoomSrv>) {
        const m: RoomMap = new Map<RoomId, RoomValueClient>()
        for (const room of rooms) {
            m.set(room.id, {
                name: room.name,
                desync_tolerance: new Decimal(room.desync_tolerance),
                major_desync_min: new Decimal(room.major_desync_min),
                minor_desync_playback_slow: new Decimal(room.minor_desync_playback_slow),
                playback_speed: new Decimal(room.playback_speed)
            })
        }
        setRooms(p => {
            return new Map<RoomId, RoomValueClient>([...p, ...m])
        })
    }

    function settingsClicked(rid: RoomId) {
        navigate<RoomSettingsHistoryState>('/main/room-settings/general', {state: {rid: rid}})
    }

    function roomClicked(rid: RoomId) {
    }

    if (roomsLoading)
        return (
            <div className="border flex-1 overflow-auto">
                <div className="flex justify-center align-middle h-full">
                    <Loading/>
                </div>
            </div>
        )

    return (
        <div className="border flex-1 overflow-auto">
            <div className="flex flex-col p-1">
                {[...rooms].map((item) => {
                    return (
                        <Clickable
                            className="flex p-2 items-center gap-x-2 w-full group"
                            onClick={() => roomClicked(item[0])}
                        >
                            <Play className="w-5"/>
                            <p>{item[1].name}</p>
                            <div className="flex-1"></div>
                            <Btn
                                className="rounded hover:bg-gray-300 p-1 dark:hover:bg-gray-500 invisible group-hover:visible w-6"
                                onClick={(e) => { e.stopPropagation(); settingsClicked(item[0]) } }
                            >
                                <Settings/>
                            </Btn>
                        </Clickable>
                    )
                })}
            </div>
        </div>
    )
}