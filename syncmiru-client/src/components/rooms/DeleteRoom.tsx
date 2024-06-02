import React, {ReactElement, useEffect, useState} from "react";
import {DeleteBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {ModalDelete} from "@components/widgets/Modal.tsx";
import {useHistoryState} from "wouter/use-browser-location";
import {RoomSettingsHistoryState} from "@models/historyState.ts";
import {useMainContext} from "@hooks/useMainContext.ts";
import {RoomValueClient} from "@models/room.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {useLocation} from "wouter";
import {navigateToMain} from "../../utils/navigate.ts";

export default function DeleteRoom(p: Props): ReactElement {
    const {t} = useTranslation()
    const [_, navigate] = useLocation()
    const {rid} = useHistoryState<RoomSettingsHistoryState>()
    const {rooms, socket} = useMainContext()
    const [room, setRoom] = useState<RoomValueClient>()
    const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)

    useEffect(() => {
        const room = rooms.get(rid)
        if (room !== undefined)
            setRoom(room)

        p.setLoading(false)
    }, [rid, rooms]);

    function deleteClicked() {
        setShowDeleteDialog(true)
    }

    function roomDeleteConfirmed() {
        p.setLoading(true)
        socket!.emitWithAck("delete_room", {id: rid})
            .then((ack: SocketIoAck<null>) => {
                if (ack.status === SocketIoAckType.Ok)
                    navigateToMain(navigate)
                else
                    showPersistentErrorAlert(t('modal-room-delete-error'))
            })
            .catch(() => {
                showPersistentErrorAlert(t('modal-room-delete-error'))
            })
            .finally(() => p.setLoading(false))
    }

    return (
        <>
            <div className="flex items-center mb-4">
                <p>{t('room-settings-delete-label')}</p>
                <div className="flex-1"></div>
                <DeleteBtn
                    className="w-10"
                    onClick={deleteClicked}
                />
            </div>
            <ModalDelete
                onDeleteConfirmed={roomDeleteConfirmed}
                content={
                    <p>{t('modal-room-delete-text')} "{room != null ? room.name : 'N/A'}"?</p>
                }
                open={showDeleteDialog}
                setOpen={setShowDeleteDialog}
            />
        </>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}