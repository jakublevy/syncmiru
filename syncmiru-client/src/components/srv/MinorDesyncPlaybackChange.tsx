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

export default function MinorDesyncPlaybackChange(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const lang = useLanguage()
    const [playbackSpeedChange, setPlaybackSpeedChange] = useState<Decimal>()
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [sliderPlaybackSpeedChange, setSliderPlaybackSpeedChange] = useState<number>(0.05)

    useEffect(() => {
        if (socket !== undefined) {
            socket.on('default_minor_desync_playback_change', onMinorDesyncPlaybackChange)
            socket.emitWithAck("get_default_minor_desync_playback_change")
                .then((ack: SocketIoAck<string>) => {
                    if (ack.status === SocketIoAckType.Err) {
                        showPersistentErrorAlert(t('minor-desync-playback-change-received-error'))
                    } else {
                        const speed = new Decimal(ack.payload as string)
                        setPlaybackSpeedChange(speed)
                        setSliderPlaybackSpeedChange(speed.toNumber())
                    }
                })
                .catch(() => {
                    showPersistentErrorAlert(t('minor-desync-playback-change-received-error'))
                })
                .finally(() => {
                    p.setLoading(false)
                })
        }
    }, [socket]);

    function onMinorDesyncPlaybackChange(speed: string) {
        setPlaybackSpeedChange(new Decimal(speed))
    }

    function editClicked() {
        if(playbackSpeedChange !== undefined)
            setSliderPlaybackSpeedChange(playbackSpeedChange.toNumber())

        setEditModalOpen(true)
    }

    function changeClicked() {
        p.setLoading(true)
        setEditModalOpen(false)
        socket!.emitWithAck("set_default_minor_desync_playback_change", {minor_desync_playback_change: sliderPlaybackSpeedChange})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showPersistentErrorAlert(t('minor-desync-playback-change-change-error'))
                }
                else {
                    setPlaybackSpeedChange(new Decimal(sliderPlaybackSpeedChange))
                }
            })
            .catch(() => {
                showPersistentErrorAlert(t('minor-desync-playback-change-change-error'))
            })
            .finally(() => {
                p.setLoading(false)
            })
    }

    function sliderValueChanged(v: number | number[]) {
        setSliderPlaybackSpeedChange(v as number)
    }


    return (
        <>
            <div className="flex items-center">
                <div className="w-64 flex items-center gap-x-1">
                    <p className={`${lang === Language.Czech ? 'w-48' : ""}`}>{t('default-room-minor-desync-playback-change-title')}</p>
                    <Help className="w-4" tooltipId="minor-desync-playback-change-help"
                          content={t('default-room-minor-desync-playback-change-help')}/>
                </div>
                <p className="font-bold">{playbackSpeedChange !== undefined ? `${playbackSpeedChange.toFixed(2)}x` : 'N/A'}</p>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
            <ModalWHeader
                title={t('minor-desync-playback-change-title')}
                open={editModalOpen}
                setOpen={setEditModalOpen}
                content={
                    <div className="flex flex-col">
                        <div className="flex mb-2">
                            <p>{t('minor-desync-playback-change-label')}&nbsp;</p>
                            <p className="font-bold">{sliderPlaybackSpeedChange.toFixed(2)}x</p>
                        </div>
                        <div className="pl-1.5 pr-1.5 mb-4">
                            <Slider
                                min={0.01}
                                max={0.1}
                                step={0.01}
                                marks={createMarks(0.01, 0.1, 0.01, 2, 'x')}
                                value={sliderPlaybackSpeedChange}
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
}