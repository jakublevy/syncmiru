import {ReactElement, useEffect, useState} from "react";
import Help from "@components/widgets/Help.tsx";
import {BtnPrimary, BtnSecondary, EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useLanguage} from "@hooks/useLanguage.ts";
import {Language} from "@models/config.tsx";
import Decimal from "decimal.js";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Slider from "rc-slider";
import {createMarks} from "src/utils/slider.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function MinorDesyncPlaybackSlow(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const lang = useLanguage()
    const [playbackSpeedSlow, setPlaybackSpeedSlow] = useState<Decimal>()
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [sliderPlaybackSpeedSlow, setSliderPlaybackSpeedSlow] = useState<number>(0.05)
    const onEventName = p.rid == null ? 'default_minor_desync_playback_slow' : 'room_minor_desync_playback_slow'
    const getEventName = p.rid == null ? "get_default_minor_desync_playback_slow" : "get_room_minor_desync_playback_slow"
    const setEventName = p.rid == null ? "set_default_minor_desync_playback_slow" : "set_room_minor_desync_playback_slow"
    const args = p.rid == null ? {} : {id: p.rid}

    useEffect(() => {
        if (socket !== undefined) {
            socket.on(onEventName, onMinorDesyncPlaybackSlow)
            socket.emitWithAck(getEventName, args)
                .then((ack: SocketIoAck<string>) => {
                    if(ack.status === SocketIoAckType.Err)
                        showPersistentErrorAlert(t('minor-desync-playback-slow-received-error'))
                    else {
                        const speed = new Decimal(ack.payload as string)
                        setPlaybackSpeedSlow(speed)
                        setSliderPlaybackSpeedSlow(speed.toNumber())
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('minor-desync-playback-slow-received-error'))
                })
                .finally(() => {
                    p.setLoading(false)
                })
        }
    }, [socket]);

    function onMinorDesyncPlaybackSlow(speed: string) {
        setPlaybackSpeedSlow(new Decimal(speed))
    }

    function editClicked() {
        if(playbackSpeedSlow !== undefined)
            setSliderPlaybackSpeedSlow(playbackSpeedSlow.toNumber())

        setEditModalOpen(true)
    }

    function changeClicked() {
        p.setLoading(true)
        setEditModalOpen(false)
        socket!.emitWithAck(setEventName, {minor_desync_playback_slow: sliderPlaybackSpeedSlow, ...args})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('minor-desync-playback-slow-change-error'))
                }
                else {
                    setPlaybackSpeedSlow(new Decimal(sliderPlaybackSpeedSlow))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('minor-desync-playback-slow-change-error'))
            })
            .finally(() => {
                p.setLoading(false)
            })
    }

    function sliderValueChanged(v: number | number[]) {
        setSliderPlaybackSpeedSlow(v as number)
    }


    return (
        <>
            <div className="flex items-center">
                <div className="w-64 flex items-center gap-x-1">
                    <p className={`${lang === Language.Czech ? 'w-[12.1rem]' : ""}`}>{t('default-room-minor-desync-playback-slow-title')}</p>
                    <Help className="w-4" tooltipId="minor-desync-playback-slow-help"
                          content={t('default-room-minor-desync-playback-slow-help')}/>
                </div>
                <p className="font-bold">{playbackSpeedSlow !== undefined ? `${playbackSpeedSlow.toFixed(2)}x` : 'N/A'}</p>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
            <ModalWHeader
                title={t('minor-desync-playback-slow-title')}
                open={editModalOpen}
                setOpen={setEditModalOpen}
                content={
                    <div className="flex flex-col">
                        <div className="flex mb-2">
                            <p>{t('minor-desync-playback-slow-label')}&nbsp;</p>
                            <p className="font-bold">{sliderPlaybackSpeedSlow.toFixed(2)}x</p>
                        </div>
                        <div className="pl-1.5 pr-1.5 mb-4">
                            <Slider
                                min={0.01}
                                max={0.1}
                                step={0.01}
                                marks={createMarks(0.01, 0.1, 0.01, 2, 'x')}
                                value={sliderPlaybackSpeedSlow}
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