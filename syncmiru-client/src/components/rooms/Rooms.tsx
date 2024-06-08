import {ReactElement, useEffect, useState, MouseEvent} from "react";
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
import Settings from "@components/svg/Settings.tsx";
import {useTranslation} from "react-i18next";
import {useLocation} from "wouter";
import {RoomSettingsHistoryState} from "@models/historyState.ts";
import {arrayMove, List, OnChangeMeta, RenderListParams} from "react-movable";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";
import {UserRoomMap, UserRoomChange, UserRoomJoin} from "@models/roomUser.ts";
import {UserId} from "@models/user.ts";
import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import Cross from "@components/svg/Cross.tsx";
import BubbleCrossed from "@components/svg/BubbleCrossed.tsx";
import Subtitles from "@components/svg/Subtitles.tsx";
import SignalGood from "@components/svg/SignalGood.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import Avatar from "@components/widgets/Avatar.tsx";

export default function Rooms(): ReactElement {
    const {
        socket,
        roomsLoading,
        setRoomsLoading,
        rooms,
        setRooms,
        users,
        setRoomConnecting,
        setCurrentRid,
        uid
    } = useMainContext()
    const {t} = useTranslation()
    const [_, navigate] = useLocation()
    const [roomsOrder, setRoomsOrder] = useState<Array<RoomId>>([])
    const [mousePos, setMousePos] = useState<[number, number]>([0, 0])
    const [roomUsers, setRoomUsers] = useState<UserRoomMap>(new Map<RoomId, Array<UserId>>())

    useEffect(() => {
        if (socket !== undefined) {
            setRoomsLoading(true)
            socket.on('rooms', onRooms)
            socket.on('room_name_change', onRoomNameChange)
            socket.on('del_rooms', onDeleteRooms)
            socket.on('room_order', onRoomOrder)
            socket.on('user_room_join', onUserRoomJoin)
            socket.on('user_room_change', onUserRoomChange)

            socket.emitWithAck("get_rooms")
                .then((roomsWOrder: RoomsWOrder) => {
                    addRoomsFromSrv(roomsWOrder.rooms)
                    setRoomsOrder(roomsWOrder.room_order)
                })
                .catch(() => {
                    navigateToLoginFormMain(navigate)
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
                if (roomValue != null)
                    m.set(roomNameChange.rid, {name: roomNameChange.room_name})
            }
            return m
        })
    }

    function onDeleteRooms(roomIdsToDelete: Array<RoomId>) {
        setRooms((p) => {
            const m: RoomMap = new Map<RoomId, RoomValue>()
            for (const [id, roomValue] of p) {
                if (!roomIdsToDelete.includes(id))
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
        setRooms((p) => {
            const m: RoomMap = new Map<RoomId, RoomValue>()
            for (const room of rooms)
                m.set(room.id, {name: room.name})

            return new Map<RoomId, RoomValue>([...p, ...m])
        })
    }

    function onUserRoomJoin(userRoomJoin: UserRoomJoin) {
        addUserToRoom(userRoomJoin)
    }

    function addUserToRoom(userRoomJoin: UserRoomJoin) {
        setRoomUsers((p) => {
            const m: UserRoomMap = new Map<RoomId, Array<UserId>>()
            for (const [rid, uids] of p) {
                if(rid !== userRoomJoin.rid) {
                    m.set(rid, uids)
                }
            }
            let roomUids = p.get(userRoomJoin.rid)
            if(roomUids != null)
                roomUids = [...roomUids, userRoomJoin.uid]
            else
                roomUids = [userRoomJoin.uid]

            m.set(userRoomJoin.rid, roomUids)
            return m
        })
    }

    function onUserRoomChange(userRoomChange: UserRoomChange) {

    }

    function settingsClicked(rid: RoomId) {
        navigate<RoomSettingsHistoryState>('/main/room-settings/general', {state: {rid: rid}})
    }

    function roomClicked(rid: RoomId) {
        console.log('room with id ' + rid + " clicked")
        setCurrentRid(rid)
        setRoomConnecting(true)
        const start = performance.now()
        socket!.emitWithAck("ping", {})
            .then(() => {
                const took = performance.now() - start
                socket!.emitWithAck("join_room", {rid: rid, ping: took})
                    .then(() => {
                        addUserToRoom({rid: rid, uid: uid})
                        console.log('join ok')
                    })
                    .catch(() => {
                        showPersistentErrorAlert("TODO join room failed")
                        setCurrentRid(null)
                    })
                    .finally(() => {
                        setRoomConnecting(false)
                    })
            })
            .catch(() => {
                showPersistentErrorAlert("TODO error")
                setRoomConnecting(false)
                setCurrentRid(null)
            })
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
                if (ack.status === SocketIoAckType.Err) {
                    setRoomsOrder(oldOrder)
                    showPersistentErrorAlert(t('room-order-change-error'))
                }
            })
            .catch(() => {
                setRoomsOrder(oldOrder)
                showPersistentErrorAlert(t('room-order-change-error'))
            })
    }

    function onRoomMouseDown(e: MouseEvent<HTMLDivElement>, rid: RoomId) {
        setMousePos([e.clientX, e.clientY])
    }

    function onRoomMouseUp(e: MouseEvent<HTMLDivElement>, rid: RoomId) {
        const x = e.clientX - mousePos[0]
        const y = e.clientY - mousePos[1]
        if (x * x + y * y <= 25)
            roomClicked(rid)
    }

    if (roomsLoading)
        return (
            <div className="border-l flex-1 overflow-auto">
                <div className="flex justify-center align-middle h-full">
                    <Loading/>
                </div>
            </div>
        )

    return (
        <>
            {rooms.size === 0
                && <div className="border-l flex-1 overflow-auto flex flex-col p-1">
                    <p className="self-center mt-4">{t('no-rooms-info')}</p>
                </div>}
            <List
                onChange={orderChanged}
                values={roomsOrder}
                renderList={({children, props}: RenderListParams) => {
                    return (
                        <ul
                            {...props}
                            className="border-l flex-1 overflow-auto p-1"
                        >{children}</ul>
                    )
                }}
                renderItem={({value: rid, props}) => {
                    const hasUsers = roomUsers.get(rid) != null
                    const roomUids = roomUsers.get(rid)
                    const roomValue = rooms.get(rid)
                    if (roomValue == null)
                        return <></>
                    return (
                        <li
                            {...props}
                            style={{
                                ...props.style,
                                listStyleType: 'none'
                            }}
                        >
                            <div className="flex flex-col">
                                <div
                                    className='flex p-2 mb-0.5 items-center gap-x-2 w-full group break-words rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer'
                                    onMouseDown={(e) => onRoomMouseDown(e, rid)}
                                    onMouseUp={(e) => onRoomMouseUp(e, rid)}
                                >
                                    <Play className="min-w-5 w-5"/>
                                    <p className="w-[9.2rem] text-left">{roomValue.name}</p>
                                    <div className="flex-1"></div>
                                    <div
                                        role="button"
                                        className='rounded hover:bg-gray-300 p-1 dark:hover:bg-gray-500 invisible group-hover:visible min-w-6 w-6'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            settingsClicked(rid)
                                        }}
                                    >
                                        <Settings/>
                                    </div>
                                </div>
                                {hasUsers && <div className="flex flex-col gap-y-0.5 mb-4">
                                    {roomUids?.map((uid) => {
                                        const user = users.get(uid)
                                        if(user == null)
                                            return <></>
                                        return (
                                            <Clickable className="py-1.5">
                                                <div className="flex items-center ml-2 mr-1">
                                                    <div className="w-10"></div>
                                                    {/*<Cross className="w-3 mr-2"/>*/}
                                                    {/*<SignalGood className="w-3 mr-2"/>*/}
                                                    <Avatar className="w-5" picBase64={user.avatar}/>
                                                    <p className="text-sm text-left ml-1.5 w-[4.4rem] break-words">{user.username}</p>
                                                    <div className="flex-1"></div>

                                                    {/*<p className="text-xs">A:4/S:3</p>*/}
                                                    {/*<BubbleCrossed className="w-4 ml-1"/>*/}
                                                    {/*<Subtitles className="ml-1 w-4"/>*/}
                                                </div>
                                            </Clickable>
                                        )
                                    })}
                                </div>}
                            </div>
                        </li>
                    )
                }
                }
            />
        </>
    )
}