import React, {ReactElement, useEffect, useRef} from "react";
import MpvThumbnail from "@components/svg/MpvThumbnail.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {Event, listen, UnlistenFn} from "@tauri-apps/api/event";
import {disconnectFromRoom, forceDisconnectFromRoom} from "src/utils/room.ts";
import {RoomConnectionState} from "@models/context.ts";
import {invoke} from "@tauri-apps/api/core";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {PlaylistEntry, PlaylistEntryId, PlaylistEntryUrl, PlaylistEntryVideo} from "@models/playlist.ts";
import {
    UserAudioSubtitles, UserChangeAudio, UserChangeAudioDelay, UserChangeAudioSync, UserChangeSub, UserChangeSubDelay,
    UserLoadedInfo,
    UserPause,
    UserPlayInfo,
    UserSeek,
    UserSpeedChangeClient,
    UserSpeedChangeSrv
} from "@models/mpv.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {UserId} from "@models/user.ts";
import {MpvMsgMood, showMpvReadyMessages, timestampPretty} from "src/utils/mpv.ts";
import Decimal from "decimal.js";

export default function Mpv(p: Props): ReactElement {
    const ctx = useMainContext()
    const {t} = useTranslation()
    const mpvWrapperRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null)
    const connectedToRoom = ctx.currentRid != null && ctx.roomConnection === RoomConnectionState.Established

    const jwtsRef = useRef(ctx.jwts);
    const source2urlRef = useRef(ctx.source2url);
    const playlistRef = useRef(ctx.playlist)
    const joinedRoomSettingsRef = useRef(ctx.joinedRoomSettings)
    const usersRef = useRef(ctx.users)
    const activeVideoIdRef = useRef(ctx.activeVideoId)
    const uid2readyRef = useRef(ctx.uid2ready)

    useEffect(() => {
        if (ctx.socket !== undefined) {
            ctx.socket.on('user_file_loaded', onUserFileLoaded)
            ctx.socket.on('user_file_load_failed', onUserFileLoadFailed)
            ctx.socket.on('user_file_load_retry', onUserFileLoadRetry)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('user_file_loaded', onUserFileLoaded)
                ctx.socket.off('user_file_load_failed', onUserFileLoadFailed)
                ctx.socket.off('user_file_load_retry', onUserFileLoadRetry)
            }
        }
    }, [ctx.socket]);

    useEffect(() => {
        if (ctx.socket !== undefined) {
            ctx.socket.on("mpv_play", onMpvPlay)
            ctx.socket.on('mpv_pause', onMpvPause)
            ctx.socket.on("mpv_seek", onMpvSeek)
            ctx.socket.on("mpv_speed_change", onMpvSpeedChange)

        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off("mpv_play", onMpvPlay)
                ctx.socket.off('mpv_pause', onMpvPause)
                ctx.socket.off("mpv_seek", onMpvSeek)
                ctx.socket.off("mpv_speed_change", onMpvSpeedChange)

            }
        }
    }, [ctx.socket, ctx.uid, ctx.uid2ready]);

    useEffect(() => {
        if(ctx.socket !== undefined) {
            ctx.socket.on('mpv_audio_change', onMpvAudioChange)
            ctx.socket.on("mpv_audio_delay_change", onMpvAudioDelayChange)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('mpv_audio_change', onMpvAudioChange)
                ctx.socket.off("mpv_audio_delay_change", onMpvAudioDelayChange)
            }
        }
    }, [ctx.socket, ctx.uid, ctx.audioSync]);

    useEffect(() => {
        if(ctx.socket !== undefined) {
            ctx.socket.on('mpv_sub_change', onMpvSubChange)
            ctx.socket.on('mpv_sub_delay_change', onMpvSubDelayChange)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('mpv_sub_change', onMpvSubChange)
                ctx.socket.off('mpv_sub_delay_change', onMpvSubDelayChange)
            }
        }
    }, [ctx.socket, ctx.uid, ctx.subSync]);

    useEffect(() => {
        let unlisten: Array<Promise<UnlistenFn>> = []

        unlisten.push(listen<boolean>('mpv-running', (e: Event<boolean>) => {
            if(!e.payload && connectedToRoom) {
                disconnectFromRoom(ctx, t)
            }
            ctx.setMpvRunning(e.payload)
        }))

        unlisten.push(listen<void>('mpv-resize', (e: Event<void>) => {
            if(ctx.mpvRunning && !ctx.mpvWinDetached) {
                if(!ctx.mpvShowSmall)
                    mpvResize()
                else
                    mpvResizeToSmall()
            }
        }))

        unlisten.push(listen<Record<"width" | "height", number>>('tauri://resize', (e) => {
            setTimeout(() => {
                if(ctx.mpvRunning && !ctx.mpvWinDetached) {
                    if(!ctx.mpvShowSmall)
                        mpvResize()
                    else
                        mpvResizeToSmall()
                }
            }, 50)
        }))

        unlisten.push(listen<boolean>('mpv-win-detached-changed', (e: Event<boolean>) => {
            ctx.setMpvWinDetached(e.payload)
        }))

        unlisten.push(listen<void>('mpv-file-loaded', (e: Event<void>) => {
            const entry = playlistRef.current.get(activeVideoIdRef.current as PlaylistEntryId) as PlaylistEntry

            const msgText = `${t('mpv-msg-file-loaded')} ${entry.pretty()}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })

            invoke<UserLoadedInfo>('mpv_get_loaded_info', {})
                .then((payload: UserLoadedInfo) => {
                    ctx.socket?.emitWithAck('mpv_file_loaded', payload)
                        .catch(() => {
                            showPersistentErrorAlert(t('mpv-load-error'))
                            disconnectFromRoom(ctx, t)
                        })
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-load-error'))
                    disconnectFromRoom(ctx, t)
                })
        }))

        unlisten.push(listen<void>('mpv-file-load-failed', (e: Event<void>) => {
            ctx.socket!.emitWithAck('mpv_file_load_failed', {})
                .then(() => {
                    showPersistentErrorAlert(t('mpv-invalid-file'))
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-load-error'))
                    disconnectFromRoom(ctx, t)
                })
        }))

        unlisten.push(listen<boolean>('mpv-pause-changed', (e: Event<boolean>) => {
            const readyState = ctx.uid2ready.get(ctx.uid)
            if(readyState == null || [UserReadyState.Loading, UserReadyState.Error].includes(readyState))
                return

            if(e.payload) {
                invoke<number>('mpv_get_timestamp', {})
                    .then((time: number) => {
                        ctx.socket!.emitWithAck('mpv_pause', time)
                            .catch(() => {
                                showPersistentErrorAlert(t('mpv-pause-error'))
                                disconnectFromRoom(ctx, t)
                            })
                    })
                    .catch(() => {
                        showPersistentErrorAlert(t('mpv-play-error'))
                        disconnectFromRoom(ctx, t)
                    })
            }
            else {
                ctx.socket?.emitWithAck('mpv_play', {})
                    .catch(() => {
                        showPersistentErrorAlert(t('mpv-play-error'))
                        disconnectFromRoom(ctx, t)
                    })
            }
        }))

        unlisten.push(listen<void>('mpv-seek', (e: Event<void>) => {
            invoke<number>('mpv_get_timestamp', {})
                .then((time: number) => {
                    ctx.socket!.emitWithAck('mpv_seek', time)
                        .catch(() => {
                            showPersistentErrorAlert(t('mpv-seek-error'))
                            disconnectFromRoom(ctx, t)
                        })
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-seek-error'))
                    disconnectFromRoom(ctx, t)
                })
        }))

        unlisten.push(listen<string>('mpv-speed-changed', (e: Event<string>) => {
            const readyState = ctx.uid2ready.get(ctx.uid)
            if(readyState == null || [UserReadyState.Loading, UserReadyState.Error].includes(readyState))
                return

            const speed = new Decimal(e.payload)

            ctx.socket!.emitWithAck('mpv_speed_change', speed)
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-speed-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }))

        unlisten.push(listen<number | null>('mpv-audio-changed', (e: Event<number | null>) => {
            ctx.socket!.emitWithAck('mpv_audio_change', e.payload)
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-audio-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }))

        unlisten.push(listen<number | null>('mpv-sub-changed', (e: Event<number | null>) => {
            ctx.socket!.emitWithAck('mpv_sub_change', e.payload)
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-sub-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }))

        unlisten.push(listen<number>('mpv-audio-delay-changed', (e: Event<number>) => {
            ctx.socket!.emitWithAck('mpv_audio_delay_change', e.payload)
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-audio-delay-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }))

        unlisten.push(listen<number>('mpv-sub-delay-changed', (e: Event<number>) => {
            ctx.socket!.emitWithAck('mpv_sub_delay_change', e.payload)
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-sub-delay-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }))

        return () => {
            unlisten.forEach(x => x.then((unsub) => unsub()))
        }
    }, [ctx.currentRid, ctx.roomConnection, ctx.mpvWinDetached, ctx.mpvShowSmall, ctx.mpvRunning, ctx.uid, ctx.uid2ready]);

    useEffect(() => {
        jwtsRef.current = ctx.jwts;
        source2urlRef.current = ctx.source2url;
        playlistRef.current = ctx.playlist
        joinedRoomSettingsRef.current = ctx.joinedRoomSettings
        usersRef.current = ctx.users
        activeVideoIdRef.current = ctx.activeVideoId
        uid2readyRef.current = ctx.uid2ready
    }, [ctx.jwts, ctx.source2url, ctx.playlist, ctx.joinedRoomSettings, ctx.users, ctx.activeVideoId, ctx.uid2ready]);

    useEffect(() => {
        if(ctx.mpvRunning && !ctx.mpvWinDetached && !ctx.mpvShowSmall)
            mpvResize()
    }, [p.mpvResizeVar, mpvWrapperRef.current, ctx.mpvRunning, ctx.mpvShowSmall, ctx.usersShown]);

    useEffect(() => {
        if(ctx.mpvRunning && !ctx.mpvWinDetached) {
            if (ctx.modalShown || ctx.settingsShown) {
                ctx.setMpvShowSmall(true)
                mpvResizeToSmall()
            } else {
                ctx.setMpvShowSmall(false)
                mpvResize()
            }
        }
    }, [ctx.modalShown, ctx.settingsShown, ctx.mpvRunning, ctx.mpvWinDetached]);
    

    useEffect(() => {
        if(ctx.activeVideoId == null)
            return

        const id = ctx.activeVideoId as PlaylistEntryId
        const entry = playlistRef.current.get(id) as PlaylistEntry
        if(entry instanceof PlaylistEntryVideo) {
            const jwt = jwtsRef.current.get(id) as string
            const video = entry as PlaylistEntryVideo
            const source = source2urlRef.current.get(video.source) as string
            const data = {
                source_url: source,
                jwt: jwt,
                playback_speed: joinedRoomSettingsRef.current.playback_speed
            }
            invoke<UserLoadedInfo>('mpv_load_from_source', {data: JSON.stringify(data)})
                .then(() => {
                    showMpvReadyMessages(uid2readyRef.current, usersRef.current, t)
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-load-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
        else if(entry instanceof PlaylistEntryUrl) {
            const video = entry as PlaylistEntryUrl
            const data = {
                url: video.url,
                playback_speed: joinedRoomSettingsRef.current.playback_speed
            }
            invoke('mpv_load_from_url', {data: JSON.stringify(data)})
                .then(() => {
                    showMpvReadyMessages(uid2readyRef.current, usersRef.current, t)
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-load-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
    }, [ctx.activeVideoId]);

    function mpvResize() {
        const mpvWrapper = mpvWrapperRef.current as HTMLDivElement
        const rect = mpvWrapper.getBoundingClientRect()

        invoke('mpv_wrapper_size_changed', {wrapperSize: rect})
            .catch(() => {
                showPersistentErrorAlert(t('mpv-resize-error'))
                forceDisconnectFromRoom(ctx, t)
            })
    }

    function mpvResizeToSmall() {
        invoke('mpv_reposition_to_small', {})
            .catch(() => {
                showPersistentErrorAlert(t('mpv-resize-error'))
                forceDisconnectFromRoom(ctx, t)
            })
    }

    function onUserFileLoaded(userPlayInfo: UserPlayInfo) {
        ctx.setUid2audioSub((p) => {
            const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
            for (const [id, value] of p) {
                if(userPlayInfo.uid !== id) {
                    m.set(id, value)
                }
            }
            m.set(userPlayInfo.uid, {
                aid: userPlayInfo.aid,
                sid: userPlayInfo.sid,
                audioSync: userPlayInfo.audio_sync,
                subSync: userPlayInfo.sub_sync
            })
            return m
        })

        ctx.setUid2ready((p) => {
            const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
            for (const [id, value] of p) {
                if(userPlayInfo.uid !== id) {
                    m.set(id, value)
                }
            }
            m.set(userPlayInfo.uid, userPlayInfo.status)

            showMpvReadyMessages(m, usersRef.current, t)
            return m
        })
    }

    function onUserFileLoadFailed(uid: UserId) {
        ctx.setUid2ready((p) => {
            const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
            for (const [id, value] of p) {
                if(uid !== id) {
                    m.set(id, value)
                }
            }
            m.set(uid, UserReadyState.Error)
            return m
        })
        ctx.setUid2audioSub((p) => {
            const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
            for (const [id, value] of p) {
                if(uid !== id) {
                    m.set(id, value)
                }
            }
            return m
        })
    }

    function onUserFileLoadRetry(uid: UserId) {
        ctx.setUid2ready((p) => {
            const m: Map<UserId, UserReadyState> = new Map<UserId, UserReadyState>()
            for (const [id, value] of p) {
                if(uid !== id) {
                    m.set(id, value)
                }
            }
            m.set(uid, UserReadyState.Loading)
            return m
        })
    }

    function onMpvPlay(uid: UserId) {
        const readyState = ctx.uid2ready.get(ctx.uid)
        if(readyState == null || [UserReadyState.Loading, UserReadyState.Error].includes(readyState))
            return

        if (uid !== ctx.uid) {
            invoke('mpv_set_pause', {pause: false})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-play-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
        const userValue = usersRef.current.get(uid)
        if (userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-user-unpause')}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onMpvPause(payload: UserPause) {
        const readyState = ctx.uid2ready.get(ctx.uid)
        if(readyState == null || [UserReadyState.Loading, UserReadyState.Error].includes(readyState))
            return

        if (payload.uid !== ctx.uid) {
            invoke('mpv_seek', {timestamp: payload.timestamp})
                .then(() => {
                    invoke('mpv_set_pause', {pause: true})
                        .catch(() => {
                            showPersistentErrorAlert(t('mpv-pause-error'))
                            disconnectFromRoom(ctx, t)
                        })
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-seek-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
        const userValue = usersRef.current.get(payload.uid)
        if (userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-user-pause')}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onMpvSeek(payload: UserSeek) {
        const readyState = ctx.uid2ready.get(ctx.uid)
        if(readyState == null || [UserReadyState.Loading, UserReadyState.Error].includes(readyState))
            return

        if(payload.uid !== ctx.uid) {
            invoke('mpv_seek', {timestamp: payload.timestamp})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-seek-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
        const userValue = usersRef.current.get(payload.uid)
        if (userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-user-seek')} ${timestampPretty(payload.timestamp)}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onMpvSpeedChange(payload: UserSpeedChangeSrv) {
        const {speed, ...p} = payload
        const clientPayload: UserSpeedChangeClient = {
            ...p,
            speed: new Decimal(speed)
        }
        if(payload.uid !== ctx.uid) {
            invoke('mpv_set_speed', {speed: clientPayload.speed})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-speed-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
        const userValue = usersRef.current.get(payload.uid)
        if(userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-speed-change')} ${clientPayload.speed.toFixed(2)}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onMpvAudioChange(payload: UserChangeAudio) {
        ctx.setUid2audioSub((p) => {
            const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
            for (const [id, value] of p) {
                m.set(id, value)
            }
            const u = m.get(payload.uid)
            if(u != null) {
                const {aid: oldAid, ...rest} = u
                m.set(payload.uid, {aid: payload.aid, ...rest})
            }
            return m
        })

        const myReadyStatus = uid2readyRef.current.get(ctx.uid)
        if(myReadyStatus == null || ![UserReadyState.NotReady, UserReadyState.Ready].includes(myReadyStatus))
            return

        if(!ctx.audioSync)
            return

        if(payload.uid !== ctx.uid) {
            invoke<number | null>('mpv_get_audio')
                .then((aid: number | null) => {
                  if(aid !== payload.aid) {
                      invoke('mpv_set_audio', {aid: payload.aid})
                          .catch(() => {
                              showPersistentErrorAlert(t('mpv-audio-change-error'))
                              disconnectFromRoom(ctx, t)
                          })

                      mpvShowAudioChangeMsg(payload)
                  }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-audio-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
        else {
            mpvShowAudioChangeMsg(payload)
        }
    }

    function mpvShowAudioChangeMsg(payload: UserChangeAudio) {
        const userValue = usersRef.current.get(payload.uid)
        if(userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-change-audio')} ${payload.aid != null ? payload.aid : '∅'}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onMpvSubChange(payload: UserChangeSub) {
        ctx.setUid2audioSub((p) => {
            const m: Map<UserId, UserAudioSubtitles> = new Map<UserId, UserAudioSubtitles>()
            for (const [id, value] of p) {
                m.set(id, value)
            }
            const u = m.get(payload.uid)
            if(u != null) {
                const {sid: oldSid, ...rest} = u
                m.set(payload.uid, {sid: payload.sid, ...rest})
            }
            return m
        })

        const myReadyStatus = uid2readyRef.current.get(ctx.uid)
        if(myReadyStatus == null || ![UserReadyState.NotReady, UserReadyState.Ready].includes(myReadyStatus))
            return

        if(!ctx.subSync)
            return

        if(payload.uid !== ctx.uid) {
            invoke<number | null>('mpv_get_sub')
                .then((sid: number | null) => {
                    if(sid !== payload.sid) {
                        invoke('mpv_set_sub', {sid: payload.sid})
                            .catch(() => {
                                showPersistentErrorAlert(t('mpv-sub-change-error'))
                                disconnectFromRoom(ctx, t)
                            })

                        mpvShowSubChangeMsg(payload)
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-sub-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
        else {
            mpvShowSubChangeMsg(payload)
        }
    }

    function mpvShowSubChangeMsg(payload: UserChangeSub) {
        const userValue = usersRef.current.get(payload.uid)
        if(userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-change-sub')} ${payload.sid != null ? payload.sid : '∅'}`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onMpvAudioDelayChange(payload: UserChangeAudioDelay) {
        const myReadyStatus = uid2readyRef.current.get(ctx.uid)
        if(myReadyStatus == null || ![UserReadyState.NotReady, UserReadyState.Ready].includes(myReadyStatus))
            return

        if(!ctx.audioSync)
            return

        if(payload.uid !== ctx.uid) {
            invoke<number>('mpv_get_audio_delay')
                .then((audio_delay: number) => {
                    if(audio_delay !== payload.audio_delay) {
                        invoke('mpv_set_audio_delay', {audioDelay: payload.audio_delay})
                            .catch(() => {
                                showPersistentErrorAlert(t('mpv-audio-delay-change-error'))
                                disconnectFromRoom(ctx, t)
                            })

                        mpvShowAudioDelayChangeMsg(payload)
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-audio-delay-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
        else {
            mpvShowAudioDelayChangeMsg(payload)
        }
    }

    function mpvShowAudioDelayChangeMsg(payload: UserChangeAudioDelay) {
        const userValue = usersRef.current.get(payload.uid)
        if(userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-audio-delay')} ${payload.audio_delay * 1000} ms`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function mpvShowSubDelayChangeMsg(payload: UserChangeSubDelay) {
        const userValue = usersRef.current.get(payload.uid)
        if(userValue != null) {
            const msgText = `${userValue.displayname} ${t('mpv-msg-sub-delay')} ${payload.sub_delay * 1000} ms`
            invoke('mpv_show_msg', {text: msgText, duration: 5, mood: MpvMsgMood.Neutral})
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-msg-show-failed'))
                })
        }
    }

    function onMpvSubDelayChange(payload: UserChangeSubDelay) {
        const myReadyStatus = uid2readyRef.current.get(ctx.uid)
        if(myReadyStatus == null || ![UserReadyState.NotReady, UserReadyState.Ready].includes(myReadyStatus))
            return

        if(!ctx.subSync)
            return

        if(payload.uid !== ctx.uid) {
            invoke<number>('mpv_get_sub_delay')
                .then((sub_delay: number) => {
                    if(sub_delay !== payload.sub_delay) {
                        invoke('mpv_set_sub_delay', {subDelay: payload.sub_delay})
                            .catch(() => {
                                showPersistentErrorAlert(t('mpv-sub-delay-change-error'))
                                disconnectFromRoom(ctx, t)
                            })

                        mpvShowSubDelayChangeMsg(payload)
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('mpv-sub-delay-change-error'))
                    disconnectFromRoom(ctx, t)
                })
        }
        else {
            mpvShowSubDelayChangeMsg(payload)
        }
    }

    return (
        <div
            className={`flex flex-col justify-center items-center h-full gap-y-3 ${ctx.mpvRunning ? 'invisible' : ''}`}
            ref={mpvWrapperRef}
        >
            <MpvThumbnail className="min-w-20 w-20 max-w-20"/>
            <p>{t('mpv-not-connected-to-room-msg')}</p>
        </div>
    )
}

interface Props {
    mpvResizeVar: boolean,
    setMpvResizeVar: (b: boolean) => void
}