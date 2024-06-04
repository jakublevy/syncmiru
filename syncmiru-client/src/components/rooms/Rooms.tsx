import {ReactElement, useEffect, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {
    RoomId,
    RoomMap,
    RoomNameChange,
    RoomSrv, RoomsWOrder, RoomValue
} from "@models/room.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import Play from "@components/svg/Play.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import Settings from "@components/svg/Settings.tsx";
import {useTranslation} from "react-i18next";
import {useLocation} from "wouter";
import {RoomSettingsHistoryState} from "@models/historyState.ts";
import {arrayMove, List, OnChangeMeta, RenderListParams} from "react-movable";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";

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
    const [roomsOrder, setRoomsOrder] = useState<Array<RoomId>>([])

    useEffect(() => {
        if (socket !== undefined) {
            setRoomsLoading(true)
            socket.on('rooms', onRooms)
            socket.on('room_name_change', onRoomNameChange)
            socket.on('del_rooms', onDeleteRooms)
            socket.on('room_order', onRoomOrder)

            socket.emitWithAck("get_rooms")
                .then((roomsWOrder: RoomsWOrder) => {
                    addRoomsFromSrv(roomsWOrder.rooms)
                    setRoomsOrder(roomsWOrder.room_order)
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
        setRoomsOrder((p) => {
            return [...p, ...rooms.map(x => x.id)]
        })
    }

    function onRoomNameChange(roomNameChanges: Array<RoomNameChange>) {
        setRooms((p) => {
            const m: RoomMap = new Map<RoomId, RoomValue>([...p])
            for (const roomNameChange of roomNameChanges) {
                const roomValue = m.get(roomNameChange.rid)
                if(roomValue != null)
                    m.set(roomNameChange.rid, {name: roomNameChange.room_name})
            }
            return m
        })
    }

    function onDeleteRooms(roomIdsToDelete: Array<RoomId>) {
        setRooms((p) => {
            const m: RoomMap = new Map<RoomId, RoomValue>()
            for(const [id, roomValue] of p) {
                if(!roomIdsToDelete.includes(id))
                    m.set(id, roomValue)
            }
            return m
        })
        setRoomsOrder((p) => {
            return p.filter(x => !roomIdsToDelete.includes(x))
        })
    }

    function onRoomOrder(roomOrder: Array<RoomId>) {
        setRoomsOrder(roomOrder)
    }

    function addRoomsFromSrv(rooms: Array<RoomSrv>) {
        console.log(rooms)
        setRooms((p) => {
            const m: RoomMap = new Map<RoomId, RoomValue>()
            for (const room of rooms)
                m.set(room.id, {name: room.name})

            return new Map<RoomId, RoomValue>([...p, ...m])
        })
    }

    function settingsClicked(rid: RoomId) {
        navigate<RoomSettingsHistoryState>('/main/room-settings/general', {state: {rid: rid}})
    }

    function roomClicked(rid: RoomId) {
    }

    function orderChanged(e: OnChangeMeta) {
        let oldOrder: Array<RoomId>
        const newOrder = arrayMove(roomsOrder, e.oldIndex, e.newIndex)
        setRoomsOrder((p) => {
            oldOrder = p
            return newOrder
        })
        socket!.emitWithAck("set_room_order", {room_order: newOrder})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    setRoomsOrder(oldOrder)
                    showPersistentErrorAlert("TODO chyba pri zmene poradi mistnosti")
                }
            })
            .catch(() => {
                setRoomsOrder(oldOrder)
                showPersistentErrorAlert("TODO chyba pri zmene poradi mistnosti")
            })
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
        <div className="border-l flex-1 overflow-auto">
            <div className="flex flex-col p-1">
                {rooms.size === 0 && <p className="self-center mt-4">{t('no-rooms-info')}</p>}

                <List
                    onChange={orderChanged}
                    values={roomsOrder}
                    renderList={({children, props}: RenderListParams) => {
                        return <ul {...props}>{children}</ul>
                    }}
                    renderItem={({value: id, props}) => {
                        const roomValue = rooms.get(id)
                        if(roomValue == null)
                            return <></>
                        return (
                            <li
                                {...props}
                                style={{
                                ...props.style,
                                    listStyleType: 'none'
                                }}
                            >
                                <div
                                    className="flex p-2 items-center gap-x-2 w-full group break-words rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer"
                                    onClick={() => roomClicked(id)}
                                >
                                    <Play className="min-w-5 w-5"/>
                                    <p className="w-[9.2rem] text-left">{roomValue.name}</p>
                                    <div className="flex-1"></div>
                                    <div
                                        className="rounded hover:bg-gray-300 p-1 dark:hover:bg-gray-500 invisible group-hover:visible min-w-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            settingsClicked(id)
                                        }}
                                    >
                                        <Settings/>
                                    </div>
                                </div>
                            </li>
                        )
                    }
                    }
                />

                {roomsOrder.map(id => {
                    const roomValue = rooms.get(id)
                    if(roomValue == null)
                        return <></>
                })}
            </div>
        </div>
    )
}