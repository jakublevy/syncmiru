import {ReactElement, useEffect, useState} from "react";
import {BtnPrimary, BtnSecondary, EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import Slider from "rc-slider";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Decimal from "decimal.js";
import {createMarks} from "src/utils/slider.ts";

export default function PlaybackSpeed(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [playbackSpeed, setPlaybackSpeed] = useState<Decimal>()
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [sliderPlaybackSpeed, setSliderPlaybackSpeed] = useState<number>(1.0)
    const getEventName = p.rid == null ? "get_default_playback_speed" : "get_room_playback_speed"
    const setEventName = p.rid == null ? "set_default_playback_speed" : "set_room_playback_speed"
    const args = p.rid == null ? {} : {id: p.rid}

    useEffect(() => {
        if (socket !== undefined) {
            if(p.rid == null)
                socket.on("default_playback_speed", onPlaybackSpeed)

            socket.emitWithAck(getEventName, args)
                .then((ack: SocketIoAck<string>) => {
                    if(ack.status === SocketIoAckType.Err)
                        showPersistentErrorAlert(t('playback-received-error'))
                    else {
                        const speed = new Decimal(ack.payload as string)
                        setPlaybackSpeed(speed)
                        setSliderPlaybackSpeed(speed.toNumber())
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('playback-received-error'))
                })
                .finally(() => {
                    p.setLoading(false)
                })
        }
    }, [socket]);

    function onPlaybackSpeed(speed: string) {
        setPlaybackSpeed(new Decimal(speed))
    }

    function editClicked() {
        if(playbackSpeed !== undefined)
            setSliderPlaybackSpeed(playbackSpeed.toNumber())

        setEditModalOpen(true)
    }

    function changeClicked() {
        p.setLoading(true)
        setEditModalOpen(false)
        socket!.emitWithAck(setEventName, {playback_speed: sliderPlaybackSpeed, ...args})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('playback-change-error'))
                }
                else {
                    setPlaybackSpeed(new Decimal(sliderPlaybackSpeed))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('playback-change-error'))
            })
            .finally(() => {
                p.setLoading(false)
            })
    }

    function sliderValueChanged(v: number | number[]) {
        setSliderPlaybackSpeed(v as number)
    }

    return (
        <>
            <div className="flex items-center">
                <p className="w-64">{t('playback-title')}</p>
                <p className="font-bold">{playbackSpeed !== undefined ? `${playbackSpeed.toFixed(2)}x` : 'N/A'}</p>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
            <ModalWHeader
                title={t('playback-speed-title')}
                open={editModalOpen}
                setOpen={setEditModalOpen}
                content={
                    <div className="flex flex-col">
                        <div className="flex mb-2">
                            <p>{t('playback-speed-label')}&nbsp;</p>
                            <p className="font-bold">{sliderPlaybackSpeed.toFixed(2)}x</p>
                        </div>
                        <div className="pl-1.5 pr-1.5 mb-4">
                            <Slider
                                min={1}
                                max={2}
                                step={0.01}
                                marks={createMarks(1, 2, 0.25, 2, 'x')}
                                value={sliderPlaybackSpeed}
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