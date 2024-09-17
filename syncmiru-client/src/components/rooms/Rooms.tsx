import React, {MouseEvent, ReactElement, useEffect, useRef, useState} from "react";
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
import {UserId, UserReadyStateChangeClient} from "@models/user.ts";
import {Clickable} from "@components/widgets/Button.tsx";
import Avatar from "@components/widgets/Avatar.tsx";
import {RoomConnectionState} from "@models/context.ts";
import UserInfoTooltip from "@components/widgets/UserInfoTooltip.tsx";
import Ping from "@components/widgets/Ping.tsx";
import Decimal from "decimal.js";
import {
    PlaylistEntry,
    PlaylistEntryId,
    PlaylistEntryType,
    PlaylistEntryUrl,
    PlaylistEntryUrlSrv,
    PlaylistEntryVideo,
    PlaylistEntryVideoSrv
} from "@models/playlist.ts";
import {invoke} from "@tauri-apps/api/core";
import ReadyState, {UserReadyState} from "@components/widgets/ReadyState.tsx";
import Bubble from "@components/svg/Bubble.tsx";
import BubbleCrossed from "@components/svg/BubbleCrossed.tsx";
import Subtitles from "@components/svg/Subtitles.tsx";
import SubtitlesCrossed from "@components/svg/SubtitlesCrossed.tsx";
import {MpvMsgMood, showMpvReadyMessages} from "src/utils/mpv.ts";
import {UserAudioSubtitles, UserChangeAudioSync, UserChangeSubSync} from "@models/mpv.ts";
import {changeActiveVideo} from "../../utils/playlist.ts";

export default function Rooms(): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()
    const [_, navigate] = useLocation()
    const [roomsOrder, setRoomsOrder] = useState<Array<RoomId>>([])
    const [mousePos, setMousePos] = useState<[number, number]>([0, 0])
    const [roomsFetching, setRoomsFetching] = useState<boolean>(true)
    const [roomUsersFetching, setRoomUsersFetching] = useState<boolean>(true)

    const usersRef = useRef(ctx.users)

    useEffect(() => {
        if (ctx.socket !== undefined) {
            setRoomsFetching(true)
            setRoomUsersFetching(true)

            ctx.socket.on('rooms', onRooms)
            ctx.socket.on('room_name_change', onRoomNameChange)
            ctx.socket.on('room_order', onRoomOrder)
            ctx.socket.on('room_user_ping', onRoomUserPing)
            ctx.socket.on('joined_room_playback_change', onJoinedRoomPlaybackChange)
            ctx.socket.on('joined_room_minor_desync_playback_slow', onJoinedRoomMinorDesyncPlaybackSlow)
            ctx.socket.on('user_ready_state_change', onUserReadyStateChange)
            ctx.socket.on('change_audio_sync', onChangeAudioSync)
            ctx.socket.on('change_sub_sync', onChangeSubSync)

            ctx.socket.emitWithAck("get_rooms")
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

            ctx.socket.emitWithAck("get_room_users")
                .then((roomUsers: UserRoomSrv) => {
                    const m: UserRoomMap = new Map<RoomId, Set<UserId>>()
                    for (const ridStr in roomUsers) {
                        const rid = parseInt(ridStr)
                        const uids = new Set(roomUsers[ridStr])
                        m.set(rid, uids)
                    }
                    ctx.setRoomUsers(m)
                })
                .catch(() => {
                    navigateToLoginFormMain(navigate)
                })
                .finally(() => {
                    setRoomUsersFetching(false)
                })
        }
        return () => {
            if (ctx.socket !== undefined) {
                ctx.socket.off('rooms', onRooms)
                ctx.socket.off('room_name_change', onRoomNameChange)
                ctx.socket.off('room_order', onRoomOrder)
                ctx.socket.off('room_user_ping', onRoomUserPing)
                ctx.socket.off('joined_room_playback_change', onJoinedRoomPlaybackChange)
                ctx.socket.off('joined_room_minor_desync_playback_slow', onJoinedRoomMinorDesyncPlaybackSlow)
                ctx.socket.off('user_ready_state_change', onUserReadyStateChange)
                ctx.socket.off('change_audio_sync', onChangeAudioSync)
                ctx.socket.off('change_sub_sync', onChangeSubSync)
            }
        }
    }, [ctx.socket]);

    useEffect(() => {
        if(ctx.socket !== undefined) {
            ctx.socket.on('del_rooms', onDeleteRooms)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('del_rooms', onDeleteRooms)
            }
        }
    }, [ctx.socket, ctx.currentRid]);

    useEffect(() => {
        if(ctx.socket !== undefined) {
            ctx.socket.on('user_room_join', onUserRoomJoin)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('user_room_join', onUserRoomJoin)
            }
        }
    }, [ctx.socket, ctx.currentRid, ctx.roomConnection, ctx.uid, ctx.activeVideoId]);

    useEffect(() => {
        if (ctx.socket !== undefined) {
            ctx.socket.on('user_room_disconnect', onUserRoomDisconnect)
            ctx.socket.on('user_room_change', onUserRoomChange)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('user_room_disconnect', onUserRoomDisconnect)
                ctx.socket.off('user_room_change', onUserRoomChange)
            }
        }
    }, [ctx.socket, ctx.currentRid, ctx.roomConnection, ctx.uid, ctx.roomUidClicked, ctx.activeVideoId]);

    useEffect(() => {
        ctx.setRoomsLoading(roomsFetching || roomUsersFetching)
    }, [roomsFetching, roomUsersFetching]);

    useEffect(() => {
        usersRef.current = ctx.users
    }, [ctx.users]);

    function onRooms(rooms: Array<RoomSrv>) {
        addRoomsFromSrv(rooms)
        setRoomsOrder((p) => {
            return [...new Set([...p, ...rooms.map(x => x.id)])]
        })
    }

    function onRoomNameChange(roomNameChanges: Array<RoomNameChange>) {
        ctx.setRooms((p) => {
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
                ctx.socket!.emitWithAck("disconnect_room", {})
                    .finally(() => {
                        ctx.setRoomConnection(RoomConnectionState.Established)
                    })
            })
            .catch(() => {
                invoke('kill_app_with_error_msg', {msg: t('mpv-quit-error')})
            })
    }

    function roomDisconnectChangeState() {
        ctx.setRoomUidClicked(-1)
        clearInterval(ctx.roomPingTimerRef?.current)
        clearInterval(ctx.timestampTimerRef?.current)
        ctx.setRoomUsers(new Map<RoomId, Set<UserId>>())
        ctx.setCurrentRid(null)
        ctx.setUidPing(new Map<UserId, number>())
    }

    function onDeleteRooms(roomIdsToDelete: Array<RoomId>) {
        if(ctx.currentRid != null && roomIdsToDelete.includes(ctx.currentRid)) {
            roomDisconnectChangeState()
        }

        ctx.setRooms((p) => {
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
        ctx.setRooms((p) => {
            const m: RoomMap = new Map<RoomId, RoomValue>()
            for (const room of rooms)
                m.set(room.id, {name: room.name})

            return new Map<RoomId, RoomValue>([...p, ...m])
        })
    }

    function onUserRoomJoin(userRoomJoin: UserRoomJoin) {
        if(ctx.roomConnection === RoomConnectionState.Established && ctx.currentRid === userRoomJoin.rid) {
            ctx.setUid2ready((p) => {
                const r: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
                for(const [k,v] of p) {
                    r.set(k, v)
                }

                r.set(userRoomJoin.uid, UserReadyState.Loading)

                if(ctx.activeVideoId != null)
                    showMpvReadyMessages(r, usersRef.current, t)

                return r
            })
        }

        ctx.setRoomUsers((p) => {
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

            if(userRoomJoin.rid === ctx.currentRid) {
                if(ctx.roomConnection === RoomConnectionState.Established && userRoomJoin.uid !== ctx.uid) {
                    const userValue = usersRef.current.get(userRoomJoin.uid)
                    if(userValue != null) {
                        const msgText = `${userValue.displayname} ${t('mpv-msg-user-join')}`
                        invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                            .catch(() => {
                                showPersistentErrorAlert(t('mpv-msg-show-failed'))
                            })
                    }
                }
            }

            return m
        })

        if (userRoomJoin.uid === ctx.uid)
            ctx.setRoomConnection(RoomConnectionState.Established)
    }

    function onUserRoomChange(userRoomChange: UserRoomChange) {
        if (userRoomChange.uid === ctx.roomUidClicked)
            ctx.setRoomUidClicked(-1)

        ctx.setUid2ready((p) => {
            const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
            for (const [id, value] of p) {
                if(userRoomChange.uid !== id) {
                    m.set(id, value)
                }
            }

            if(userRoomChange.new_rid === ctx.currentRid
                && (ctx.roomConnection === RoomConnectionState.Established || userRoomChange.uid === ctx.uid)) {
                m.set(userRoomChange.uid, UserReadyState.Loading)
            }

            if(
                ctx.roomConnection === RoomConnectionState.Established
                && ctx.currentRid === userRoomChange.old_rid
                && ctx.uid !== userRoomChange.uid
            ) {
                const userValue = usersRef.current.get(userRoomChange.uid)
                if(userValue != null) {
                    const msgText = `${userValue.displayname} ${t('mpv-msg-user-leave')}`
                    invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                        .catch(() => {
                            showPersistentErrorAlert(t('mpv-msg-show-failed'))
                        })

                }
                if(ctx.activeVideoId != null)
                    showMpvReadyMessages(m, usersRef.current, t)
            }

            return m
        })

        ctx.setUid2audioSub((p) => {
            const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
            for (const [id, value] of p) {
                if(userRoomChange.uid !== id) {
                    m.set(id, value)
                }
            }
            return m
        })

        ctx.setRoomUsers((p) => {
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

        if (userRoomChange.uid === ctx.uid)
            ctx.setRoomConnection(RoomConnectionState.Established)
    }

    function onRoomUserPing(roomUserPingChange: RoomUserPingChange) {
        changeRoomUserPing(roomUserPingChange)
    }

    function onJoinedRoomPlaybackChange(playback: string) {
        ctx.setJoinedRoomSettings((p) => {
            const {playback_speed, ...rest} = p
            return {
                playback_speed: new Decimal(playback),
                ...rest
            }
        })
    }

    function onJoinedRoomMinorDesyncPlaybackSlow(minorDesyncPlaybackSlow: string) {
        ctx.setJoinedRoomSettings((p) => {
            const {minor_desync_playback_slow, ...rest} = p
            return {
                minor_desync_playback_slow: new Decimal(minorDesyncPlaybackSlow),
                ...rest
            }
        })
    }

    function onUserReadyStateChange(userReadyStateChange: UserReadyStateChangeClient) {
        ctx.setUid2ready((p) => {
            const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
            for (const [id, value] of p) {
                if(userReadyStateChange.uid !== id) {
                    m.set(id, value)
                }
            }
            m.set(userReadyStateChange.uid, userReadyStateChange.ready_state)

            showMpvReadyMessages(m, usersRef.current, t)
            return m
        })
    }

    function onChangeAudioSync(userChangeAudioSync: UserChangeAudioSync) {
        ctx.setUid2audioSub((p) => {
            const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
            for(const [id, value] of p) {
                if(id !== userChangeAudioSync.uid)
                    m.set(id, value)
            }
            const oldValue = p.get(userChangeAudioSync.uid)
            if(oldValue != null) {
                const {audio_sync: oldAudioSync, ...rest} = oldValue
                const newValue = {
                    audio_sync: userChangeAudioSync.audio_sync,
                    ...rest
                } as UserAudioSubtitles;
                m.set(userChangeAudioSync.uid, newValue)
            }
            return m
        })
    }

    function onChangeSubSync(userChangeSubSync: UserChangeSubSync) {
        ctx.setUid2audioSub((p) => {
            const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
            for(const [id, value] of p) {
                if(id !== userChangeSubSync.uid)
                    m.set(id, value)
            }
            const oldValue = p.get(userChangeSubSync.uid)
            if(oldValue != null) {
                const {sub_sync: oldSubSync, ...rest} = oldValue
                const newValue = {
                    sub_sync: userChangeSubSync.sub_sync,
                    ...rest
                } as UserAudioSubtitles;
                m.set(userChangeSubSync.uid, newValue)
            }
            return m
        })
    }

    function changeRoomUserPing(roomUserPingChange: RoomUserPingChange) {
        ctx.setUidPing((p) => {
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
        if (userRoomDisconnect.uid === ctx.roomUidClicked)
            ctx.setRoomUidClicked(-1)

        ctx.setUid2ready((p) => {
            const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
            for (const [id, value] of p) {
                if(userRoomDisconnect.uid !== id) {
                    m.set(id, value)
                }
            }

            if(
                ctx.roomConnection === RoomConnectionState.Established
                && ctx.currentRid === userRoomDisconnect.rid
                && ctx.uid !== userRoomDisconnect.uid
            ) {
                const userValue = usersRef.current.get(userRoomDisconnect.uid)
                if(userValue != null) {
                    const msgText = `${userValue.displayname} ${t('mpv-msg-user-leave')}`
                    invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                        .catch(() => {
                            showPersistentErrorAlert(t('mpv-msg-show-failed'))
                        })

                    if(ctx.activeVideoId != null)
                        showMpvReadyMessages(m, usersRef.current, t)
                }
            }

            return m
        })

        ctx.setUid2audioSub((p) => {
            const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
            for (const [id, value] of p) {
                if(userRoomDisconnect.uid !== id) {
                    m.set(id, value)
                }
            }
            return m
        })

        ctx.setRoomUsers((p) => {
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
        clearInterval(ctx.roomPingTimerRef?.current)
        ctx.roomPingTimerRef!.current = setInterval(() => {
            const start = performance.now()
            ctx.socket!.emitWithAck("ping", {})
                .then(() => {
                    const took = performance.now() - start
                    ctx.socket!.emitWithAck("room_ping", {ping: took})
                        .then((ack: SocketIoAck<null>) => {
                            if (ack.status === SocketIoAckType.Err) {
                                clearInterval(ctx.roomPingTimerRef?.current)
                                ctx.setCurrentRid(null)
                            }
                            else {
                                changeRoomUserPing({uid: ctx.uid, ping: took})
                            }
                        })
                        .catch(() => {
                            clearInterval(ctx.roomPingTimerRef?.current)
                            ctx.setCurrentRid(null)
                        })
                })
        }, 3000)
    }

    function roomClicked(rid: RoomId) {
        if (ctx.currentRid === rid || [RoomConnectionState.Connecting, RoomConnectionState.Disconnecting].includes(ctx.roomConnection))
            return

        ctx.setCurrentRid(rid)
        ctx.setRoomConnection(RoomConnectionState.Connecting)
        const start = performance.now()
        ctx.setPlaylistLoading(true)
        ctx.setActiveVideoId(null)
        ctx.setUid2ready(new Map<UserId, UserReadyState>())
        ctx.setUid2audioSub(new Map<UserId, UserAudioSubtitles>())
        ctx.socket!.emitWithAck("ping", {})
            .then(() => {
                const took = performance.now() - start

                const a = new Map<UserId, number>()
                a.set(ctx.uid, took)
                ctx.setUidPing(a)

                ctx.socket!.emitWithAck("join_room", {rid: rid, ping: took})
                    .then((ack: SocketIoAck<JoinedRoomInfoSrv>) => {
                        if (ack.status === SocketIoAckType.Err) {
                            forceDisconnectFromRoomOnFetchFailure()
                        } else {
                            invoke('mpv_start', {})
                                .then(() => {
                                    invoke('mpv_remove_current_from_playlist', {})
                                        .then(() => {
                                            invoke('mpv_clear_msgs', {})
                                                .then(() => {
                                                    const payload = ack.payload as JoinedRoomInfoSrv
                                                    const roomPingsSrv = payload.room_pings
                                                    const roomSettingsSrv = payload.room_settings
                                                    const playlistSrv = payload.playlist
                                                    const playlistOrder = payload.playlist_order
                                                    const uid2ReadyStateSrv = payload.ready_status
                                                    const usersAudioSub = payload.users_audio_sub

                                                    const pings: UserRoomPingsClient = new Map<UserId, number>()
                                                    for(const uidStr in roomPingsSrv) {
                                                        const uid = parseInt(uidStr)
                                                        pings.set(uid, roomPingsSrv[uid])
                                                    }
                                                    ctx.setUidPing(pings)

                                                    const roomSettings: RoomSettingsClient = {
                                                        playback_speed: new Decimal(roomSettingsSrv.playback_speed),
                                                        minor_desync_playback_slow: new Decimal(roomSettingsSrv.minor_desync_playback_slow)
                                                    }
                                                    ctx.setJoinedRoomSettings(roomSettings)
                                                    startPingTimer()

                                                    const p: Map<PlaylistEntryId, PlaylistEntry> = new Map<PlaylistEntryId, PlaylistEntry>()
                                                    for(const idStr in playlistSrv) {
                                                        const id = parseInt(idStr)
                                                        const type = playlistSrv[idStr].type
                                                        if(type === PlaylistEntryType.Video) {
                                                            const valueSrv = playlistSrv[idStr] as PlaylistEntryVideoSrv
                                                            p.set(id, new PlaylistEntryVideo(valueSrv.source, valueSrv.path))
                                                        }
                                                        else if(type === PlaylistEntryType.Url) {
                                                            const value = playlistSrv[idStr] as PlaylistEntryUrlSrv
                                                            p.set(id, new PlaylistEntryUrl(value.url))
                                                        }
                                                    }
                                                    ctx.setPlaylist(p)
                                                    ctx.setPlaylistOrder(playlistOrder)

                                                    const readyStates: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
                                                    for(const uidStr in uid2ReadyStateSrv) {
                                                        const uid = parseInt(uidStr)
                                                        const readyState = uid2ReadyStateSrv[uid] as UserReadyState
                                                        readyStates.set(uid, readyState)
                                                    }
                                                    ctx.setUid2ready((p) => new Map<UserId, UserReadyState>([...p, ...readyStates]))

                                                    const audioSubs: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
                                                    for(const idStr in usersAudioSub) {
                                                        const id = parseInt(idStr)
                                                        const audioSub = usersAudioSub[id]
                                                        audioSubs.set(id, audioSub)
                                                    }
                                                    ctx.setUid2audioSub(audioSubs)

                                                    if(payload.active_video_id != null)
                                                        changeActiveVideo(ctx, t, payload.active_video_id)
                                                })
                                                .catch(() => {
                                                    forceDisconnectFromRoomOnFetchFailure()
                                                })
                                        })
                                        .catch(() => {
                                            forceDisconnectFromRoomOnFetchFailure()
                                        })
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
                        ctx.setRoomConnection(RoomConnectionState.Established)
                        ctx.setPlaylistLoading(false)
                    })
            })
            .catch(() => {
                showPersistentErrorAlert(t('room-join-ping-error'))
                ctx.setCurrentRid(null)
                ctx.setRoomConnection(RoomConnectionState.Established)
                ctx.setPlaylistLoading(false)
            })
    }

    function orderChanged(e: OnChangeMeta) {
        let oldOrder: Array<RoomId>
        const newOrder = arrayMove(roomsOrder, e.oldIndex, e.newIndex)
        setRoomsOrder((p) => {
            oldOrder = p
            return newOrder
        })
        ctx.socket!.emitWithAck("set_room_order", {room_order: newOrder})
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
            ctx.setRoomUidClicked(id)
        else
            ctx.setRoomUidClicked(-1)
    }

    if (ctx.roomsLoading)
        return (
            <div className="border-l flex-1 overflow-auto">
                <div className="flex justify-center align-middle h-full">
                    <Loading/>
                </div>
            </div>
        )

    return (
        <>
            {ctx.rooms.size === 0
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
                    const roomUids = ctx.roomUsers.get(rid)
                    const hasUsers = roomUids != null && roomUids.size > 0
                    const roomValue = ctx.rooms.get(rid)
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
                                        const user = ctx.users.get(uid)
                                        const showAdditional = rid === ctx.currentRid
                                        const ping = ctx.uidPing.get(uid)
                                        const readyState = ctx.uid2ready.get(uid)
                                        const audioSub = ctx.uid2audioSub.get(uid)
                                        if (user == null)
                                            return <div key={uid}></div>
                                        return (
                                            <div key={uid}>
                                                <UserInfoTooltip
                                                    key={uid}
                                                    id={uid}
                                                    visible={uid === ctx.roomUidClicked}
                                                    content={
                                                        <Clickable
                                                            className={`w-full py-1.5 ${uid === ctx.roomUidClicked ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
                                                            <div className="flex items-center ml-2 mr-1">
                                                                {ctx.activeVideoId != null
                                                                    ? <>
                                                                        {readyState != null
                                                                            ? <ReadyState
                                                                                className="w-3 h-5 mr-2"
                                                                                state={readyState}/>
                                                                            : <div className="w-5"></div>
                                                                        }
                                                                      </>
                                                                    : <div className="w-5"></div>}
                                                                {showAdditional && ping != null
                                                                    ? <Ping id={`${uid}_ping`} ping={ping} className="w-3 mr-2"/>
                                                                    : <div className="w-5"></div>
                                                                }
                                                                <Avatar className="w-6" picBase64={user.avatar}/>
                                                                <p className="text-sm text-left ml-1.5 w-[4.4rem] break-words">{user.displayname}</p>
                                                                <div className="flex-1"></div>

                                                                {readyState != null && ![UserReadyState.Loading, UserReadyState.Error].includes(readyState) && audioSub != null
                                                                && <>
                                                                        <p className="text-xs">{`A:${audioSub.aid != null ? audioSub.aid : '∅'}/S:${audioSub.sid != null ? audioSub.sid : '∅'}`}</p>
                                                                        {audioSub.audio_sync
                                                                            ? <Bubble className="min-w-4 w-4 ml-1"/>
                                                                            : <BubbleCrossed className="min-w-4 w-4 ml-1"/>
                                                                        }
                                                                        {audioSub.sub_sync
                                                                            ? <Subtitles className="min-w-4 w-4 ml-1"/>
                                                                            : <SubtitlesCrossed className="min-w-4 w-4 ml-1"/>
                                                                        }
                                                                    </>
                                                                }
                                                            </div>
                                                        </Clickable>
                                                    }
                                                    user={user}
                                                    audioSub={audioSub}
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