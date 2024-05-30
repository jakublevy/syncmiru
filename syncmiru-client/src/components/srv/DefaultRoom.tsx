import {ReactElement, useState} from "react";
import {useLocation} from "wouter";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useTranslation} from "react-i18next";
import PlaybackSpeed from "@components/srv/PlaybackSpeed.tsx";
import DesyncTolerance from "@components/srv/DesyncTolerance.tsx";
import MajorDesyncMin from "@components/srv/MajorDesyncMin.tsx";
import MajorDesyncAction from "@components/srv/MajorDesyncAction.tsx";
import Loading from "@components/Loading.tsx";
import MinorDesyncPlaybackChange from "@components/srv/MinorDesyncPlaybackChange.tsx";
import MinorDesyncAction from "@components/srv/MinorDesyncAction.tsx";

export default function DefaultRoom(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const [playbackSpeedLoading, setPlaybackSpeedLoading] = useState<boolean>(true)
    const [desyncToleranceLoading, setDesyncToleranceLoading] = useState<boolean>(true)
    const [minorDesyncPlaybackChangeLoading, setMinorDesyncPlaybackChangeLoading] = useState<boolean>(true)
    const [minorDesyncActionLoading, setMinorDesyncActionLoading] = useState<boolean>(false)
    const [majorDesyncMinLoading, setMajorDesyncMinLoading] = useState<boolean>(true)
    const [majorDesyncActionLoading, setMajorDesyncActionLoading] = useState<boolean>(false)

    function showContent() {
        return !playbackSpeedLoading
            && !desyncToleranceLoading
            && !majorDesyncMinLoading
            && !majorDesyncActionLoading
            && !minorDesyncPlaybackChangeLoading
            && !minorDesyncActionLoading
    }

    return (
        <>
            {!showContent() &&
                <div className="flex justify-center items-center h-full">
                    <Loading/>
                </div>
            }
            {<div className={`flex flex-col ${showContent() ? '' : 'hidden'}`}>
                <div className="flex items-center m-8">
                    <h1 className="text-2xl font-bold">{t('default-room-title')}</h1>
                    <div className="flex-1"></div>
                    <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
                </div>
                <div className="m-8">
                    <h2 className="text-xl font-semibold">{t('default-room-player-title')}</h2>
                    <div className="flex flex-col mt-4 gap-y-6">
                        <PlaybackSpeed
                            setLoading={(b) => setPlaybackSpeedLoading(b)}
                        />
                    </div>
                </div>
                <div className="m-8">
                    <h2 className="text-xl font-semibold">{t('default-room-sync-title')}</h2>
                    <div className="flex flex-col mt-4 gap-y-6">
                        <DesyncTolerance
                            setLoading={(b) => setDesyncToleranceLoading(b)}
                        />
                        <MinorDesyncPlaybackChange
                            setLoading={(b) => setMinorDesyncPlaybackChangeLoading(b)}
                        />
                        <MinorDesyncAction
                            setLoading={(b) => setMinorDesyncActionLoading(b)}
                        />
                        <MajorDesyncMin
                            setLoading={(b) => setMajorDesyncMinLoading(b)}
                        />
                        <MajorDesyncAction
                            setLoading={(b) => setMajorDesyncActionLoading(b)}
                        />
                    </div>
                </div>
            </div> }
        </>
    )
}