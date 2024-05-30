import {ReactElement, useState} from "react";
import {useLocation} from "wouter";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useTranslation} from "react-i18next";
import PlaybackSpeedDefault from "@components/srv/PlaybackSpeedDefault.tsx";
import DesyncToleranceDefault from "@components/srv/DesyncToleranceDefault.tsx";
import MajorDesyncMinDefault from "@components/srv/MajorDesyncMinDefault.tsx";
import MajorDesyncActionDefault from "@components/srv/MajorDesyncActionDefault.tsx";
import Loading from "@components/Loading.tsx";

export default function DefaultRoom(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const [playbackSpeedLoading, setPlaybackSpeedLoading] = useState<boolean>(true)
    const [desyncToleranceLoading, setDesyncToleranceLoading] = useState<boolean>(true)
    const [majorDesyncMinLoading, setMajorDesyncMinLoading] = useState<boolean>(false)
    const [majorDesyncActionLoading, setMajorDesyncActionLoading] = useState<boolean>(false)

    function showContent() {
        return !playbackSpeedLoading && !desyncToleranceLoading && !majorDesyncMinLoading && !majorDesyncActionLoading
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
                        <PlaybackSpeedDefault
                            setLoading={(b) => setPlaybackSpeedLoading(b)}
                        />
                    </div>
                </div>
                <div className="m-8">
                    <h2 className="text-xl font-semibold">{t('default-room-sync-title')}</h2>
                    <div className="flex flex-col mt-4 gap-y-6">
                        <DesyncToleranceDefault
                            setLoading={(b) => setDesyncToleranceLoading(b)}
                        />
                        <MajorDesyncMinDefault
                            setLoading={(b) => setMajorDesyncMinLoading(b)}
                        />
                        <MajorDesyncActionDefault
                            setLoading={(b) => setMajorDesyncActionLoading(b)}
                        />
                    </div>
                </div>
            </div> }
        </>
    )
}