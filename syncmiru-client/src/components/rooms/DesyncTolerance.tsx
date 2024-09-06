import {ReactElement, useEffect, useState} from "react";
import {BtnPrimary, BtnSecondary, EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import Help from "@components/widgets/Help.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import Decimal from "decimal.js";
import Slider from "rc-slider";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import {createMarks} from "src/utils/slider.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {RoomDesyncTolerance} from "@models/room.ts";

export default function DesyncTolerance(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [desyncTolerance, setDesyncTolerance] = useState<Decimal>();
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [sliderDesyncTolerance, setSliderDesyncTolerance] = useState<number>(2.0)
    const onEventName = p.rid == null ? 'default_desync_tolerance' : 'room_desync_tolerance'
    const getEventName = p.rid == null ? "get_default_desync_tolerance" : "get_room_desync_tolerance"
    const setEventName = p.rid == null ? "set_default_desync_tolerance" : "set_room_desync_tolerance"
    const args = p.rid == null ? {} : {id: p.rid}

    useEffect(() => {
        if (socket !== undefined) {
            socket.on(onEventName, onDesyncTolerance)
            socket.emitWithAck(getEventName, args)
                .then((ack: SocketIoAck<string>) => {
                    if(ack.status === SocketIoAckType.Err)
                        showPersistentErrorAlert(t('desync-tolerance-received-error'))
                    else {
                        const desyncTolerance = new Decimal(ack.payload as string)
                        setDesyncTolerance(desyncTolerance)
                        setSliderDesyncTolerance(desyncTolerance.toNumber())
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('desync-tolerance-received-error'))
                })
                .finally(() => {
                    p.setLoading(false)
                })
        }
        return () => {
            if(socket !== undefined) {
                socket.off(onEventName, onDesyncTolerance)
            }
        }
    }, [socket]);

    function onDesyncTolerance(desyncTolerance: string | RoomDesyncTolerance) {
        if(p.rid == null)
            setDesyncTolerance(new Decimal(desyncTolerance as string))
        else {
            const s = desyncTolerance as RoomDesyncTolerance
            if(s.id === p.rid)
                setDesyncTolerance(new Decimal(s.desync_tolerance))
        }
    }

    function editClicked() {
        if(desyncTolerance !== undefined)
            setSliderDesyncTolerance(desyncTolerance.toNumber())

        setEditModalOpen(true)
    }

    function sliderValueChanged(v: number | number[]) {
        setSliderDesyncTolerance(v as number)
    }

    function changeClicked() {
        p.setLoading(true)
        setEditModalOpen(false)
        socket!.emitWithAck(setEventName, {desync_tolerance: sliderDesyncTolerance, ...args})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('desync-tolerance-change-error'))
                }
                else {
                    setDesyncTolerance(new Decimal(sliderDesyncTolerance))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('desync-tolerance-change-error'))
            })
            .finally(() => {
                p.setLoading(false)
            })
    }

    return (
        <>
            <div className="flex items-center">
                <div className="w-64 flex items-center gap-x-1">
                    <p>{t('default-room-desync-tolerance-title')}</p>
                    <Help className="w-4" tooltipId="desync-tolerance-help" content={t('default-room-desync-tolerance-help')}/>
                </div>
                <p className="font-bold">{desyncTolerance !== undefined ? `${desyncTolerance.toFixed(1)}s` : 'N/A'}</p>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
            <ModalWHeader
                title={t('desync-tolerance-title')}
                open={editModalOpen}
                setOpen={setEditModalOpen}
                content={
                    <div className="flex flex-col">
                        <div className="flex mb-2">
                            <p>{t('desync-tolerance-label')}&nbsp;</p>
                            <p className="font-bold">{sliderDesyncTolerance.toFixed(1)}s</p>
                        </div>
                        <div className="pl-1.5 pr-1.5 mb-4">
                            <Slider
                                min={1}
                                max={3}
                                step={0.1}
                                marks={createMarks(1, 3, 0.5, 1, 's')}
                                value={sliderDesyncTolerance}
                                onChange={sliderValueChanged}
                            />
                        </div>
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary onClick={changeClicked}>{t('modal-change-action-btn')}</BtnPrimary>
                            <BtnSecondary onClick={() => setEditModalOpen(false)}>{t('modal-keep-btn')}</BtnSecondary>
                        </div>
                    </div>
                }
            />
        </>
    )
}

interface Props {
    setLoading: (b: boolean) => void
    rid?: number
}