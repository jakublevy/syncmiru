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
import {UserAudioSubtitles, UserLoadedInfo, UserPause, UserPlayInfo, UserSeek} from "@models/mpv.ts";
import {UserReadyState} from "@components/widgets/ReadyState.tsx";
import {UserId} from "@models/user.ts";
import {MpvMsgMood, showMpvReadyMessages, timestampPretty} from "src/utils/mpv.ts";

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

    useEffect(() => {
        if (ctx.socket !== undefined) {
            ctx.socket.on('user_play_info_changed', onUserPlayInfoChanged)
            ctx.socket.on('user_file_load_failed', onUserFileLoadFailed)
            ctx.socket.on('user_file_load_retry', onUserFileLoadRetry)
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off('user_play_info_changed', onUserPlayInfoChanged)
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
        }
        return () => {
            if(ctx.socket !== undefined) {
                ctx.socket.off("mpv_play", onMpvPlay)
                ctx.socket.off('mpv_pause', onMpvPause)
                ctx.socket.off("mpv_seek", onMpvSeek)
            }
        }
    }, [ctx.socket, ctx.uid]);

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
            console.log('pause changed')
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

        return () => {
            unlisten.forEach(x => x.then((unsub) => unsub()))
        }
    }, [ctx.currentRid, ctx.roomConnection, ctx.mpvWinDetached, ctx.mpvShowSmall, ctx.mpvRunning]);

    useEffect(() => {
        jwtsRef.current = ctx.jwts;
        source2urlRef.current = ctx.source2url;
        playlistRef.current = ctx.playlist
        joinedRoomSettingsRef.current = ctx.joinedRoomSettings
        usersRef.current = ctx.users
        activeVideoIdRef.current = ctx.activeVideoId
    }, [ctx.jwts, ctx.source2url, ctx.playlist, ctx.joinedRoomSettings, ctx.users, ctx.activeVideoId]);

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

    function onUserPlayInfoChanged(userPlayInfo: UserPlayInfo) {
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
        if (uid != ctx.uid) {
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
        if (payload.uid != ctx.uid) {
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
        if(payload.uid != ctx.uid) {
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
