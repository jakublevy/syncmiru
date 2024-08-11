import React, {MouseEvent, ReactElement, useEffect, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {
    JoinedRoomInfoSrv,
    RoomId,
    RoomMap,
    RoomNameChange,
    RoomSettingsClient,
    RoomSrv,
    RoomsWOrder,
    RoomValue
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
import {
    RoomUserPingChange,
    UserRoomChange,
    UserRoomDisconnect,
    UserRoomJoin,
    UserRoomMap,
    UserRoomPingsClient,
    UserRoomSrv
} from "@models/roomUser.ts";
import {UserId} from "@models/user.ts";
import {Clickable} from "@components/widgets/Button.tsx";
import Avatar from "@components/widgets/Avatar.tsx";
import {RoomConnectionState} from "@models/context.ts";
import UserInfoTooltip from "@components/widgets/UserInfoTooltip.tsx";
import Ping from "@components/widgets/Ping.tsx";
import Decimal from "decimal.js";
import {
    PlaylistEntry,
    PlaylistEntryId, PlaylistEntrySubtitles, PlaylistEntrySubtitlesSrv,
    PlaylistEntryType,
    PlaylistEntryUrl, PlaylistEntryUrlSrv,
    PlaylistEntryVideo, PlaylistEntryVideoSrv
} from "@models/playlist.ts";
import {MultiMap} from "mnemonist";
import {invoke} from "@tauri-apps/api/core";
import ReadyState, {UserReadyState} from "@components/widgets/ReadyState.tsx";
import BubbleCrossed from "@components/svg/BubbleCrossed.tsx";
import Subtitles from "@components/svg/Subtitles.tsx";

export default function Rooms(): ReactElement {
    const {
        socket,
        currentRid,
        setCurrentRid,
        roomUsers,
        setRoomUsers,
        roomUidClicked,
        setRoomUidClicked,
        roomsLoading,
        setRoomsLoading,
        rooms,
        setRooms,
        roomPingTimerRef,
        uidPing,
        setUidPing,
        uid,
        roomConnection,
        setRoomConnection,
        users,
        setJoinedRoomSettings,
        setPlaylist,
        setPlaylistOrder,
        setPlaylistLoading,
        setSubtitles
    } = useMainContext()
    const {t} = useTranslation()
    const [_, navigate] = useLocation()
    const [roomsOrder, setRoomsOrder] = useState<Array<RoomId>>([])
    const [mousePos, setMousePos] = useState<[number, number]>([0, 0])
    const [roomsFetching, setRoomsFetching] = useState<boolean>(true)
    const [roomUsersFetching, setRoomUsersFetching] = useState<boolean>(true)
    const [uid2ready, setUid2ready] = useState<Map<UserId, UserReadyState>>(new Map<UserId, UserReadyState>())

    useEffect(() => {
        if (socket !== undefined) {
            setRoomsFetching(true)
            setRoomUsersFetching(true)

            socket.on('rooms', onRooms)
            socket.on('room_name_change', onRoomNameChange)
            socket.on('room_order', onRoomOrder)
            socket.on('user_room_join', onUserRoomJoin)
            socket.on('user_room_change', onUserRoomChange)
            socket.on('room_user_ping', onRoomUserPing)
            socket.on('joined_room_playback_change', onJoinedRoomPlaybackChange)
            socket.on('joined_room_minor_desync_playback_slow', onJoinedRoomMinorDesyncPlaybackSlow)

            socket.emitWithAck("get_rooms")
                .then((roomsWOrder: RoomsWOrder) => {
                    addRoomsFromSrv(roomsWOrder.rooms)
                    setRoomsOrder(roomsWOrder.room_order)
                })
                .catch(() => {
                    navigateToLoginFormMain(navigate)
                })
                .finally(() => {
                    setRoomsFetching(false)
                })

            socket.emitWithAck("get_room_users")
                .then((roomUsers: UserRoomSrv) => {
                    const m: UserRoomMap = new Map<RoomId, Set<UserId>>()
                    for (const ridStr in roomUsers) {
                        const rid = parseInt(ridStr)
                        const uids = new Set(roomUsers[ridStr])
                        m.set(rid, uids)
                    }
                    setRoomUsers(m)
                })
                .catch(() => {
                    navigateToLoginFormMain(navigate)
                })
                .finally(() => {
                    setRoomUsersFetching(false)
                })
        }
    }, [socket]);

    useEffect(() => {
        if(socket !== undefined) {
            socket.on('del_rooms', onDeleteRooms)
        }
    }, [socket, currentRid]);

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('user_room_disconnect', onUserRoomDisconnect)
        }
    }, [socket, roomUidClicked]);

    useEffect(() => {
        setRoomsLoading(roomsFetching || roomUsersFetching)
    }, [roomsFetching, roomUsersFetching]);

    function onRooms(rooms: Array<RoomSrv>) {
        addRoomsFromSrv(rooms)
        setRoomsOrder((p) => {
            return [...new Set([...p, ...rooms.map(x => x.id)])]
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

    function forceDisconnectFromRoomOnFetchFailure() {
        roomDisconnectChangeState()
        showPersistentErrorAlert(t('room-join-failed'))
        invoke('mpv_quit', {})
            .then(() => {
                socket!.emitWithAck("disconnect_room", {})
                    .finally(() => {
                        setRoomConnection(RoomConnectionState.Established)
                    })
            })
            .catch(() => {
                invoke('kill_app_with_error_msg', {msg: t('mpv-quit-error')})
            })
    }

    function roomDisconnectChangeState() {
        setRoomUidClicked(-1)
        clearInterval(roomPingTimerRef?.current)
        setRoomUsers(new Map<RoomId, Set<UserId>>())
        setCurrentRid(null)
        setUidPing(new Map<UserId, number>())
    }

    function onDeleteRooms(roomIdsToDelete: Array<RoomId>) {
        if(currentRid != null && roomIdsToDelete.includes(currentRid)) {
            roomDisconnectChangeState()
        }

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
        setRoomUsers((p) => {
            const m: UserRoomMap = new Map<RoomId, Set<UserId>>()
            for (const [rid, uids] of p) {
                if (rid !== userRoomJoin.rid) {
                    m.set(rid, uids)
                }
            }
            let roomUids = p.get(userRoomJoin.rid)
            if (roomUids != null)
                roomUids.add(userRoomJoin.uid)
            else {
                roomUids = new Set()
                roomUids.add(userRoomJoin.uid)
            }
            m.set(userRoomJoin.rid, roomUids)
            return m
        })

        if (userRoomJoin.uid === uid)
            setRoomConnection(RoomConnectionState.Established)
    }

    function onUserRoomChange(userRoomChange: UserRoomChange) {
        setRoomUsers((p) => {
            const m: UserRoomMap = new Map<RoomId, Set<UserId>>()
            for (const [rid, uids] of p) {
                if (rid !== userRoomChange.old_rid || rid !== userRoomChange.new_rid)
                    m.set(rid, uids)
            }
            let oldRoomUids = p.get(userRoomChange.old_rid)
            if (oldRoomUids != null)
                oldRoomUids.delete(userRoomChange.uid)
            else
                oldRoomUids = new Set()
            m.set(userRoomChange.old_rid, oldRoomUids)

            let newRoomUids = p.get(userRoomChange.new_rid)
            if (newRoomUids != null)
                newRoomUids.add(userRoomChange.uid)
            else {
                newRoomUids = new Set()
                newRoomUids.add(userRoomChange.uid)
            }
            m.set(userRoomChange.new_rid, newRoomUids)
            return m
        })

        if (userRoomChange.uid === uid)
            setRoomConnection(RoomConnectionState.Established)
    }

    function onRoomUserPing(roomUserPingChange: RoomUserPingChange) {
        changeRoomUserPing(roomUserPingChange)
    }

    function onJoinedRoomPlaybackChange(playback: string) {
        setJoinedRoomSettings((p) => {
            const {playback_speed, ...rest} = p
            return {
                playback_speed: new Decimal(playback),
                ...rest
            }
        })
    }

    function onJoinedRoomMinorDesyncPlaybackSlow(minorDesyncPlaybackSlow: string) {
        setJoinedRoomSettings((p) => {
            const {minor_desync_playback_slow, ...rest} = p
            return {
                minor_desync_playback_slow: new Decimal(minorDesyncPlaybackSlow),
                ...rest
            }
        })
    }

    function changeRoomUserPing(roomUserPingChange: RoomUserPingChange) {
        setUidPing((p) => {
            const m: UserRoomPingsClient = new Map<UserId, number>()
            for (const [uid, ping] of p) {
                if(uid !== roomUserPingChange.uid)
                    m.set(uid, ping)
            }
            m.set(roomUserPingChange.uid, roomUserPingChange.ping)
            return m
        })
    }

    function onUserRoomDisconnect(userRoomDisconnect: UserRoomDisconnect) {
        if (userRoomDisconnect.uid === roomUidClicked)
            setRoomUidClicked(-1)

        setRoomUsers((p) => {
            const m: UserRoomMap = new Map<RoomId, Set<UserId>>()
            for (const [rid, uids] of p) {
                if (rid !== userRoomDisconnect.rid)
                    m.set(rid, uids)
            }
            let roomUids = p.get(userRoomDisconnect.rid)
            if (roomUids != null)
                roomUids.delete(userRoomDisconnect.uid)
            else
                roomUids = new Set()

            m.set(userRoomDisconnect.rid, roomUids)
            return m
        })
    }

    function settingsClicked(rid: RoomId) {
        navigate<RoomSettingsHistoryState>('/main/room-settings/general', {state: {rid: rid}})
    }

    function startPingTimer() {
        clearInterval(roomPingTimerRef?.current)
        roomPingTimerRef!.current = setInterval(() => {
            const start = performance.now()
            socket!.emitWithAck("ping", {})
                .then(() => {
                    const took = performance.now() - start
                    socket!.emitWithAck("room_ping", {ping: took})
                        .then((ack: SocketIoAck<null>) => {
                            if (ack.status === SocketIoAckType.Err) {
                                clearInterval(roomPingTimerRef?.current)
                                setCurrentRid(null)
                            }
                            else {
                                changeRoomUserPing({uid: uid, ping: took})
                            }
                        })
                        .catch(() => {
                            clearInterval(roomPingTimerRef?.current)
                            setCurrentRid(null)
                        })
                })
        }, 3000)
    }

    function roomClicked(rid: RoomId) {
        if (currentRid === rid || [RoomConnectionState.Connecting, RoomConnectionState.Disconnecting].includes(roomConnection))
            return

        setCurrentRid(rid)
        setRoomConnection(RoomConnectionState.Connecting)
        const start = performance.now()
        setPlaylistLoading(true)
        socket!.emitWithAck("ping", {})
            .then(() => {
                const took = performance.now() - start

                const a = new Map<UserId, number>()
                a.set(uid, took)
                setUidPing(a)

                socket!.emitWithAck("join_room", {rid: rid, ping: took})
                    .then((ack: SocketIoAck<JoinedRoomInfoSrv>) => {
                        if (ack.status === SocketIoAckType.Err) {
                            forceDisconnectFromRoomOnFetchFailure()
                        } else {
                            invoke('mpv_start', {})
                                .then(() => {
                                    const payload = ack.payload as JoinedRoomInfoSrv
                                    const roomPingsSrv = payload.room_pings
                                    const roomSettingsSrv = payload.room_settings
                                    const playlistSrv = payload.playlist
                                    const playlistOrder = payload.playlist_order
                                    const subsOrderSrv = payload.subs_order
                                    const uid2ReadyStateSrv = payload.ready_status

                                    const pings: UserRoomPingsClient = new Map<UserId, number>()
                                    for(const uidStr in roomPingsSrv) {
                                        const uid = parseInt(uidStr)
                                        pings.set(uid, roomPingsSrv[uid])
                                    }
                                    setUidPing(pings)

                                    const roomSettings: RoomSettingsClient = {
                                        playback_speed: new Decimal(roomSettingsSrv.playback_speed),
                                        minor_desync_playback_slow: new Decimal(roomSettingsSrv.minor_desync_playback_slow)
                                    }
                                    setJoinedRoomSettings(roomSettings)
                                    startPingTimer()

                                    const p: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
                                    for(const idStr in playlistSrv) {
                                        const id = parseInt(idStr)
                                        const type = playlistSrv[idStr].type
                                        if(type === PlaylistEntryType.Video) {
                                            const valueSrv = playlistSrv[idStr] as PlaylistEntryVideoSrv
                                            p.set(id, new PlaylistEntryVideo(valueSrv.source, valueSrv.path))
                                        }

                                        else if(type === PlaylistEntryType.Subtitles) {
                                            const value = playlistSrv[idStr] as PlaylistEntrySubtitlesSrv
                                            p.set(id, new PlaylistEntrySubtitles(value.source, value.path, value.video_id))
                                        }

                                        else if(type === PlaylistEntryType.Url) {
                                            const value = playlistSrv[idStr] as PlaylistEntryUrlSrv
                                            p.set(id, new PlaylistEntryUrl(value.url))
                                        }
                                    }
                                    setPlaylist(p)

                                    const s: MultiMap<PlaylistEntryId, PlaylistEntryId, Set<PlaylistEntryId>> = new MultiMap<PlaylistEntryId, PlaylistEntryId>(Set)
                                    for(const vidStr in subsOrderSrv) {
                                        const sids = subsOrderSrv[vidStr]
                                        for(const sid of sids)
                                            s.set(parseInt(vidStr), sid)
                                    }
                                    setSubtitles(s)
                                    setPlaylistOrder(playlistOrder)

                                    const readyStates: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
                                    for(const uidStr in uid2ReadyStateSrv) {
                                        const uid = parseInt(uidStr)
                                        const readyState = uid2ReadyStateSrv[uid] as UserReadyState
                                        readyStates.set(uid, readyState)
                                    }
                                    setUid2ready(readyStates)
                                })
                                .catch(() => {
                                    forceDisconnectFromRoomOnFetchFailure()
                                })
                        }
                    })
                    .catch(() => {
                        forceDisconnectFromRoomOnFetchFailure()
                    })
                    .finally(() => {
                        setRoomConnection(RoomConnectionState.Established)
                        setPlaylistLoading(false)
                    })
            })
            .catch(() => {
                showPersistentErrorAlert(t('room-join-ping-error'))
                setCurrentRid(null)
                setRoomConnection(RoomConnectionState.Established)
                setPlaylistLoading(false)
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
        if(e.button !== 0)
            return

        const x = e.clientX - mousePos[0]
        const y = e.clientY - mousePos[1]
        if (x * x + y * y <= 25)
            roomClicked(rid)
    }

    function userTooltipVisibilityChanged(visible: boolean, id: UserId) {
        if (visible)
            setRoomUidClicked(id)
        else
            setRoomUidClicked(-1)
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
                    const {key, ...restProps} = props
                    const roomUids = roomUsers.get(rid)
                    const hasUsers = roomUids != null && roomUids.size > 0
                    const roomValue = rooms.get(rid)
                    if (roomValue == null)
                        return <></>
                    return (
                        <li
                            key={key}
                            {...restProps}
                            style={{
                                ...props.style,
                                listStyleType: 'none'
                            }}
                        >
                            <div className="flex flex-col">
                                <div
                                    data-movable-handle={true}
                                    className='flex p-2 mb-0.5 items-center gap-x-2 w-full group break-words rounded hover:bg-gray-100 dark:hover:bg-gray-700 hover:cursor-pointer'
                                    onMouseDown={(e) => onRoomMouseDown(e, rid)}
                                    onMouseUp={(e) => onRoomMouseUp(e, rid)}
                                >
                                    <Play className="min-w-5 w-5"/>
                                    <p className="w-[8.0rem] text-left">{roomValue.name}</p>
                                    <div className="flex-1"></div>
                                    <div
                                        role="button"
                                        className='rounded hover:bg-gray-300 p-1 dark:hover:bg-gray-500 invisible group-hover:visible min-w-6 w-6'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            settingsClicked(rid)
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onMouseUp={(e) => e.stopPropagation()}
                                    >
                                        <Settings/>
                                    </div>
                                </div>
                                {hasUsers && <div className="flex flex-col gap-y-0.5 mb-4">
                                    {Array.from(roomUids)?.map((uid) => {
                                        const user = users.get(uid)
                                        const showAdditional = rid === currentRid
                                        const ping = uidPing.get(uid)
                                        const readyState = uid2ready.get(uid)
                                        if (user == null)
                                            return <div key={uid}></div>
                                        return (
                                            <div key={uid}>
                                                <UserInfoTooltip
                                                    key={uid}
                                                    id={uid}
                                                    visible={uid === roomUidClicked}
                                                    content={
                                                        <Clickable
                                                            className={`w-full py-1.5 ${uid === roomUidClicked ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                                                            <div className="flex items-center ml-2 mr-1">
                                                                {}
                                                                {readyState != null
                                                                    ? <ReadyState
                                                                        className="w-3 mr-2"
                                                                        state={readyState}/>
                                                                    : <div className="w-5"></div>
                                                                }
                                                                {showAdditional && ping != null
                                                                    ? <Ping id={`${uid}_ping`} ping={ping} className="w-3 mr-2"/>
                                                                    : <div className="w-5"></div>
                                                                }
                                                                <Avatar className="w-6" picBase64={user.avatar}/>
                                                                <p className="text-sm text-left ml-1.5 w-[4.4rem] break-words">{user.displayname}</p>
                                                                <div className="flex-1"></div>

                                                                {/*<p className="text-xs">A:4/S:3</p>*/}
                                                                {/*<BubbleCrossed className="w-4 ml-1"/>*/}
                                                                {/*<Subtitles className="ml-1 w-4"/>*/}
                                                            </div>
                                                        </Clickable>
                                                    }
                                                    user={user}
                                                    tooltipOnlineVisibilityChanged={userTooltipVisibilityChanged}
                                                />
                                            </div>
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