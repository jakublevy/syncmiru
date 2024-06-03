import {ReactElement, useState} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import PlaybackSpeed from "@components/rooms/PlaybackSpeed.tsx";
import {useHistoryState} from "wouter/use-browser-location";
import {RoomSettingsHistoryState} from "@models/historyState.ts";
import DesyncTolerance from "@components/rooms/DesyncTolerance.tsx";

export default function RoomSyncSettings(): ReactElement {
    const [_, navigate] = useLocation()
    const {rid} = useHistoryState<RoomSettingsHistoryState>()
    const {rooms} = useMainContext()
    const [playbackSpeedLoading, setPlaybackSpeedLoading] = useState<boolean>(true)
    const [desyncToleranceLoading, setDesyncToleranceLoading] = useState<boolean>(true)
    const {t} = useTranslation()

    function showContent() {
        return !playbackSpeedLoading && !desyncToleranceLoading
    }

    return (
        <>
            {!showContent() &&
                <div className="flex justify-center items-center h-full">
                    <Loading/>
                </div>
            }
            <div className={`flex flex-col ${showContent() ? '' : 'hidden'}`}>
                <div className="flex items-center m-8">
                    <h1 className="text-2xl font-bold">{t('room-settings-player-sync-title')}</h1>
                    <div className="flex-1"></div>
                    <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
                </div>
                <div className="m-8">
                    <h2 className="text-xl font-semibold">{t('room-settings-player-title')}</h2>
                    <div className="flex flex-col mt-4 gap-y-6">
                        <PlaybackSpeed
                            setLoading={(b) => setPlaybackSpeedLoading(b)}
                            rid={rid}
                        />
                    </div>
                </div>
                <div className="m-8">
                    <h2 className="text-xl font-semibold">{t('room-settings-sync-title')}</h2>
                    <div className="flex flex-col mt-4 gap-y-6">
                        <DesyncTolerance
                            setLoading={(b) => setDesyncToleranceLoading(b)}
                            rid={rid}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}