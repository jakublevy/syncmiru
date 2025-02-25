import React, {ReactElement, useState} from "react";
import Loading from "@components/Loading.tsx";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import PlaybackSpeed from "@components/rooms/PlaybackSpeed.tsx";
import {useHistoryState} from "wouter/use-browser-location";
import {RoomSettingsHistoryState} from "@models/historyState.ts";
import DesyncTolerance from "@components/rooms/DesyncTolerance.tsx";
import MinorDesyncPlaybackSlow from "@components/rooms/MinorDesyncPlaybackSlow.tsx";
import MajorDesyncMin from "@components/rooms/MajorDesyncMin.tsx";
import {InfoBanner} from "@components/widgets/Banner.tsx";

export default function RoomSyncSettings(): ReactElement {
    const [_, navigate] = useLocation()
    const {rid} = useHistoryState<RoomSettingsHistoryState>()
    const [playbackSpeedLoading, setPlaybackSpeedLoading] = useState<boolean>(true)
    const [desyncToleranceLoading, setDesyncToleranceLoading] = useState<boolean>(true)
    const [minorDesyncPlaybackSlowLoading, setMinorDesyncPlaybackSlowLoading] = useState<boolean>(true)
    const [majorDesyncMinLoading, setMajorDesyncMinLoading] = useState<boolean>(true)
    const {t} = useTranslation()

    function showContent() {
        return !playbackSpeedLoading && !desyncToleranceLoading && !minorDesyncPlaybackSlowLoading && !majorDesyncMinLoading
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
                <div className="ml-8 mr-8">
                    <InfoBanner
                        title={t('room-sync-settings-banner-title')}
                        content={t('room-sync-settings-banner-text')}
                    />
                </div>
                <div className="mx-8 mb-8 mt-4">
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
                        <MinorDesyncPlaybackSlow
                            setLoading={(b) => setMinorDesyncPlaybackSlowLoading(b)}
                            rid={rid}
                        />
                        <MajorDesyncMin
                            setLoading={(b) => setMajorDesyncMinLoading(b)}
                            rid={rid}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}