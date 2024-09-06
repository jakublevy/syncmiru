import {MouseEvent, ReactElement, useEffect, useState} from "react";
import {CloseBtn, DeleteBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import Pc from "@components/svg/Pc.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {UserSession, UserSessionStrTime} from "src/models/user.ts";
import DateTimeLocalPretty from "@components/widgets/DateTimeLocalPretty.tsx";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {useTranslation} from "react-i18next";
import {ModalDelete} from "@components/widgets/Modal.tsx";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";

export default function Devices(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const {socket } = useMainContext()
    const [loading, setLoading] = useState<boolean>(true)
    const [activeSessionReceived, setActiveSessionReceived] = useState<boolean>(false)
    const [inactiveSessionReceived, setInactiveSessionReceived] = useState<boolean>(false)
    const [activeSession, setActiveSession]
        = useState<UserSession>({device_name: '', last_access_at: new Date(), os: '', id: 0})
    const [inactiveSessions, setInactiveSessions] = useState<Array<UserSession>>([])
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
    const [deletingSession, setDeletingSession] = useState<UserSession>({device_name: '', last_access_at: new Date(), os: '', id: 0})

    useEffect(() => {
        if(socket !== undefined) {
            socket.on('active_session', onActiveSession)
            socket.on('inactive_sessions', onInactiveSessions)
            socket.emit("get_user_sessions")
        }
        return () => {
            if(socket !== undefined) {
                socket.off('active_session', onActiveSession)
                socket.off('inactive_sessions', onInactiveSessions)
            }
        }
    }, [socket]);

    useEffect(() => {
        if(activeSessionReceived && inactiveSessionReceived)
            setLoading(false)
    }, [activeSessionReceived, inactiveSessionReceived]);

    function onActiveSession(sessionStrTime: UserSessionStrTime) {
        const {last_access_at, ...rest} = sessionStrTime
        setActiveSession({
            last_access_at: new Date(sessionStrTime.last_access_at),
            ...rest
        } as UserSession)
        setActiveSessionReceived(true)
    }

    function onInactiveSessions(sessionsStrTime: Array<UserSessionStrTime>) {
        const userSessions = sessionsStrTime.map(x => {
            return {
                device_name: x.device_name,
                os: x.os,
                id: x.id,
                last_access_at: new Date(x.last_access_at)
        } as UserSession})
        setInactiveSessions(userSessions)
        setInactiveSessionReceived(true)
    }

    function onSessionDelete(e: MouseEvent<HTMLButtonElement>) {
        let session = inactiveSessions.find(x => x.id === parseInt(e.currentTarget.id)) as UserSession
        setDeletingSession(session)
        setShowDeleteDialog(true)
    }

    function sessionDeleteConfirmed() {
        setLoading(true)
        socket!.emitWithAck("delete_session", {id: deletingSession.id})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Ok) {
                    const filtered = inactiveSessions.filter(x => x.id !== deletingSession.id)
                    setInactiveSessions(filtered)
                }
                else {
                    showPersistentErrorAlert(t('sessions-delete-error'))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('sessions-delete-error'))
            })
            .finally(() => setLoading(false))
    }

    if (loading)
        return (
            <div className="flex justify-center items-center h-full">
                <Loading/>
            </div>
        )

    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('sessions-devices')}</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
            <div className="m-8">
                <h2 className="text-xl font-semibold">{t('sessions-current')}</h2>
                <div className="flex mt-4">
                    <Pc className="w-8 mr-2"/>
                    <p>{activeSession.device_name}</p>
                    <p>・{activeSession.os}</p>
                </div>
            </div>
            {inactiveSessions.length > 0 &&
                <div className="m-8">
                <h2 className="text-xl font-semibold">{t('sessions-inactive')}</h2>
                    {inactiveSessions
                        .sort((x,y) => y.last_access_at.getTime() - x.last_access_at.getTime())
                        .map(((session, i) => {
                        return (
                            <div className="flex items-center mt-2" key={i}>
                                <Pc className="w-8 mr-2" key={`${i}_pc`}/>
                                <div className="flex flex-col" key={`${i}_flex`}>
                                    <p key={`${i}_desc`}>{session.device_name}・{session.os}</p>
                                    <p key={`${i}_last_access_at`}>{t('sessions-last-active')} {<DateTimeLocalPretty datetime={session.last_access_at}/>}</p>
                                </div>
                                <div className="flex-1" key={`${i}_spacer`}></div>
                                <DeleteBtn id={session.id.toString()} className="p-2 w-10" key={`${i}_delete`} onClick={onSessionDelete}/>
                            </div>
                        )
                    }))}
                </div>}
            <ModalDelete
                onDeleteConfirmed={sessionDeleteConfirmed}
                content={
                    <div className="flex items-center mt-2">
                        <Pc className="w-8 mr-2"/>
                        <div className="flex flex-col">
                            <p>{deletingSession.device_name}・{deletingSession.os}</p>
                            <p>{t('sessions-last-active')} {<DateTimeLocalPretty datetime={deletingSession.last_access_at}/>}</p>
                        </div>
                    </div>
            }
                open={showDeleteDialog}
                setOpen={setShowDeleteDialog}
            />
        </div>
    )
}
