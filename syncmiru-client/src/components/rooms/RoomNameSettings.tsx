import {ReactElement, useEffect, useState} from "react";
import {useHistoryState} from "wouter/use-browser-location";
import {RoomSettingsHistoryState} from "@models/historyState.ts";
import {useMainContext} from "@hooks/useMainContext.ts";
import {RoomValueClient} from "@models/room.ts";
import {BtnPrimary, BtnSecondary, EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {Input} from "@components/widgets/Input.tsx";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Joi from "joi";
import {roomNameValidate} from "src/form/validators.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {useForm} from "react-hook-form";
import {joiResolver} from "@hookform/resolvers/joi";

export default function RoomNameSettings(p: Props): ReactElement {
    const {rid} = useHistoryState<RoomSettingsHistoryState>()
    const {t} = useTranslation()
    const {rooms, socket} = useMainContext()
    const [room, setRoom] = useState<RoomValueClient>()
    const [open, setOpen] = useState<boolean>(false)
    const formSchema = Joi.object({
        roomName: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .custom((v: string, h) => {
                if(!roomNameValidate(v))
                    return h.message({custom: t('title-invalid-format')})
                return v
            })
            .external(async (v: string, h) => {
                if(v === room?.name)
                    return h.message({external: t('modal-room-name-no-change-error')})

                let ack = await socket!.emitWithAck("check_room_name_unique", {room_name: v})
                if(ack.status === SocketIoAckType.Err || (ack.status === SocketIoAckType.Ok && !ack.payload))
                    return h.message({external: t('modal-room-name-not-unique')})
                return v
            }),
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<FormFields>({resolver: joiResolver(formSchema)});

    useEffect(() => {
        const room = rooms.get(rid)
        if (room !== undefined)
            setRoom(room)
        else
            showPersistentErrorAlert(t('room-name-fetch-error'))
        p.setLoading(false)
    }, [rid, rooms]);

    function editClicked() {
        const name = room?.name
        if(name != null)
            reset({roomName: name})
        else
            reset()

        setOpen(true)
    }

    function changeRoomName(data: FormFields) {
        p.setLoading(true)
        setOpen(false)
        socket!
            .emitWithAck("set_room_name", {rid: rid, room_name: data.roomName})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('modal-room-name-change-error'))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('modal-room-name-change-error'))
            })
            .finally(() => p.setLoading(false))
    }

    return (
        <>
            <div className="flex items-center">
                <p className="w-56">{t('room-settings-name-label')}</p>
                <p className="font-bold">{room != null ? room.name : 'N/A'}</p>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
            <ModalWHeader
                title={t('modal-change-room-name-title')}
                open={open}
                setOpen={setOpen}
                content={
                    <form onSubmit={handleSubmit(changeRoomName)} noValidate>
                        <div className="flex justify-between">
                            <Label htmlFor="displayname">{t('modal-room-name-label')}</Label>
                            <Help
                                tooltipId="roomName-help"
                                className="w-4"
                                content={t('modal-room-name-help')}
                            />
                        </div>
                        <Input
                            id="roomName"
                            {...register('roomName')}
                        />
                        {errors.roomName
                            ? <p className="text-danger font-semibold">{errors.roomName.message}</p>
                            : <p className="text-danger invisible font-semibold">L</p>}
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary type="submit">{t('modal-change-action-btn')}</BtnPrimary>
                            <BtnSecondary onClick={() => setOpen(false)}>{t('modal-keep-btn')}</BtnSecondary>
                        </div>
                    </form>
                }
            />
        </>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}

interface FormFields {
    roomName: string
}