import {ReactElement, useEffect, useState} from "react";
import {BtnPrimary, BtnSecondary, EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import Slider from "rc-slider";
import {ModalWHeader} from "@components/widgets/Modal.tsx";

export default function PlaybackSpeedDefault(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [playbackSpeed, setPlaybackSpeed] = useState<number>()
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [sliderPlaybackSpeed, setSliderPlaybackSpeed] = useState<number>(1.0)

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('default_playback_speed', onPlaybackSpeed)
            socket.emitWithAck("get_default_playback_speed")
                .then((ack: SocketIoAck<string>) => {
                    if (ack.status === SocketIoAckType.Err) {
                        showPersistentErrorAlert(t('playback-received-error'))
                    } else {
                        const speed = parseFloat(ack.payload as string)
                        setPlaybackSpeed(speed)
                        setSliderPlaybackSpeed(speed)
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

    function onPlaybackSpeed(speed: number) {
        setPlaybackSpeed(speed)
    }

    function editClicked() {
        if(playbackSpeed !== undefined)
            setSliderPlaybackSpeed(playbackSpeed)

        setEditModalOpen(true)
    }

    function changeClicked() {
        socket!.emitWithAck("set_default_playback_speed", {playback_speed: sliderPlaybackSpeed})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('playback-change-error'))
                }
                else {
                    setPlaybackSpeed(sliderPlaybackSpeed)
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('playback-change-error'))
            })
            .finally(() => {
                setEditModalOpen(false)
            })
    }

    function sliderSpeedChanged(v: number | number[]) {
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
                                min={1.0}
                                max={2.0}
                                step={0.01}
                                defaultValue={1.0}
                                marks={{
                                    1: "1.00x",
                                    1.25: "1.25x",
                                    1.5: "1.50x",
                                    1.75: "1.75x",
                                    2: "2.00x",
                                }}
                                value={sliderPlaybackSpeed}
                                onChange={sliderSpeedChanged}
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
}