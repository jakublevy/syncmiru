import React, {ReactElement, useState} from "react";
import Play from "@components/svg/Play.tsx";
import {MenuItem} from "@szhsin/react-menu";
import {useTranslation} from "react-i18next";
import Joi from "joi";
import {roomNameValidate} from "src/form/validators.ts";
import {useMainContext} from "@hooks/useMainContext.ts";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import {useForm} from "react-hook-form";
import {joiResolver} from "@hookform/resolvers/joi";
import Label from "@components/widgets/Label.tsx";
import {Input} from "@components/widgets/Input.tsx";
import Help from "@components/widgets/Help.tsx";
import {BtnPrimary, BtnSecondary} from "@components/widgets/Button.tsx";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function RoomCreate(): ReactElement {
    const {t} = useTranslation()
    const {socket, setRoomsLoading} = useMainContext()
    const [createRoomModalOpen, setCreateRoomModalOpen] = useState<boolean>(false);
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

    function createRoomClicked() {
        reset()
        setCreateRoomModalOpen(true)
    }

    function createRoom(data: FormFields) {
        setRoomsLoading(true)
        setCreateRoomModalOpen(false)
        socket!.emitWithAck("create_room", {room_name: data.roomName})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err)
                    showPersistentErrorAlert(t('modal-create-room-error'))
            })
            .catch(() => {
                showPersistentErrorAlert(t('modal-create-room-error'))
            })
            .finally(() => {
                setRoomsLoading(false)
            })
    }

    return (
        <>
            <MenuItem onClick={createRoomClicked}>
                <div className="flex gap-x-3">
                    <Play className="h-6 w-6"/>
                    <p>{t('srv-info-create-room')}</p>
                </div>
            </MenuItem>
            <ModalWHeader
                title={t('modal-create-room-title')}
                open={createRoomModalOpen}
                setOpen={setCreateRoomModalOpen}
                content={
                    <form onSubmit={handleSubmit(createRoom)} noValidate>
                        <div className="flex flex-col">
                            <div className="flex justify-between">
                                <Label htmlFor="roomName">{t('modal-room-name-label')}</Label>
                                <Help
                                    tooltipId="roomName-help"
                                    className="w-4"
                                    content={t('modal-room-name-help')}
                                />
                            </div>
                            <Input
                                id="roomName"
                                required
                                {...register('roomName')}
                            />
                            {errors.roomName
                                ? <p className="text-danger font-semibold">{errors.roomName.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>}

                        </div>
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary type="submit">{t('modal-create-action-btn')}</BtnPrimary>
                            <BtnSecondary
                                onClick={() => setCreateRoomModalOpen(false)}>{t('modal-cancel-btn')}</BtnSecondary>
                        </div>
                    </form>
                }
            />
        </>
    )
}

interface FormFields {
    roomName: string
}