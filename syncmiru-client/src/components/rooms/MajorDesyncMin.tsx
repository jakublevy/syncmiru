import {ReactElement, useEffect, useState} from "react";
import {BtnPrimary, BtnSecondary, EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import Help from "@components/widgets/Help.tsx";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Slider from "rc-slider";
import {createMarks} from "src/utils/slider.ts";
import {useMainContext} from "@hooks/useMainContext.ts";
import Decimal from "decimal.js";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function MajorDesyncMin(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [majorDesyncMin, setMajorDesyncMin] = useState<Decimal>();
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [sliderMajorDesyncMin, setSliderMajorDesyncMin] = useState<number>(5.0)
    const onEventName = p.rid == null ? 'default_major_desync_min' : 'room_major_desync_min'
    const getEventName = p.rid == null ? "get_default_major_desync_min" : "get_room_major_desync_min"
    const setEventName = p.rid == null ? "set_default_major_desync_min" : "set_room_major_desync_min"
    const args = p.rid == null ? {} : {id: p.rid}

    useEffect(() => {
        if (socket !== undefined) {
            socket.on(onEventName, onMajorDesyncMin)
            socket.emitWithAck(getEventName, args)
                .then((ack: SocketIoAck<string>) => {
                    if(ack.status === SocketIoAckType.Err)
                        showPersistentErrorAlert(t('major-desync-min-received-error'))
                    else {
                        const majorDesyncMin = new Decimal(ack.payload as string)
                        setMajorDesyncMin(majorDesyncMin)
                        setSliderMajorDesyncMin(majorDesyncMin.toNumber())
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('major-desync-min-received-error'))
                })
                .finally(() => {
                    p.setLoading(false)
                })
        }
    }, [socket]);

    function onMajorDesyncMin(majorDesyncMin: string) {
        setMajorDesyncMin(new Decimal(majorDesyncMin))
    }

    function editClicked() {
        if(majorDesyncMin !== undefined)
            setSliderMajorDesyncMin(majorDesyncMin.toNumber())

        setEditModalOpen(true)
    }

    function sliderValueChanged(v: number | number[]) {
        setSliderMajorDesyncMin(v as number)
    }

    function changeClicked() {
        p.setLoading(true)
        setEditModalOpen(false)
        socket!.emitWithAck(setEventName, {major_desync_min: sliderMajorDesyncMin, ...args})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('major-desync-min-change-error'))
                }
                else {
                    setMajorDesyncMin(new Decimal(sliderMajorDesyncMin))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('major-desync-min-change-error'))
            })
            .finally(() => {
                p.setLoading(false)
            })
    }

    return (
        <>
            <div className="flex items-center">
                <div className="w-64 flex items-center gap-x-1">
                    <p>{t('default-room-major-desync-min-title')}</p>
                    <Help className="w-4" tooltipId="desync-min-help" content={t('default-room-major-desync-min-help')}/>
                </div>
                <p className="font-bold">{majorDesyncMin !== undefined ? `${majorDesyncMin.toFixed(1)}s` : 'N/A'}</p>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
            <ModalWHeader
                title={t('major-desync-min-title')}
                open={editModalOpen}
                setOpen={setEditModalOpen}
                content={
                    <div className="flex flex-col">
                        <div className="flex mb-2">
                            <p>{t('major-desync-min-label')}&nbsp;</p>
                            <p className="font-bold">{sliderMajorDesyncMin.toFixed(1)}s</p>
                        </div>
                        <div className="pl-1.5 pr-1.5 mb-4">
                            <Slider
                                min={4}
                                max={10}
                                step={0.1}
                                marks={createMarks(4, 10, 0.5, 1, 's')}
                                value={sliderMajorDesyncMin}
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