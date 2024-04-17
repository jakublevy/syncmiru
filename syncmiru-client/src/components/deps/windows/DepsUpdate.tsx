import {ReactElement, useEffect, useState} from "react";
import {useDepsVersions} from "@hooks/useDepsVersions.ts";
import Loading from "@components/Loading.tsx";
import {useLocation} from "wouter";
import {compare} from "compare-versions";
import Card from "@components/widgets/Card.tsx";
import {BtnPrimary, BtnSecondary} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {MpvDownloadHistoryState} from "@models/mpvDownloadHistoryState.ts";

export default function DepsUpdate(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const [loading, setLoading] = useState<boolean>(true)
    const [updateAvailable, setUpdateAvailable]
        = useState<UpdateAvailable>({mpv: false, yt_dlp: false})
    const {
        data: depsVersions,
        error: depsVersionsError
    } = useDepsVersions()

    useEffect(() => {
        if(depsVersionsError !== undefined)
            navigate("/login-dispatch")

    }, [depsVersionsError]);

    useEffect(() => {
        if(depsVersions !== undefined) {
            const mpv_update = compare(depsVersions.mpv_newest, depsVersions.mpv_cur, '>')
            const yt_dlp_update = compare(depsVersions.yt_dlp_newest, depsVersions.yt_dlp_cur, '>')
            if(!mpv_update && !yt_dlp_update) {
                navigate('/login-dispatch')
            }
            setUpdateAvailable({ mpv: mpv_update, yt_dlp: yt_dlp_update })
            setLoading(false)
        }
    }, [depsVersions]);

    function updateLater() {
        navigate('/login-dispatch')
    }

    function updateNow() {
        if(updateAvailable.mpv) {
            navigate('/mpv-download', {state: {yt_dlp: updateAvailable.yt_dlp} as MpvDownloadHistoryState})
        }
        else {
            navigate('/yt-dlp-download')
        }
    }

    if(loading)
        return <Loading/>

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[32rem] w-[40rem] m-3">
                <div className="flex items-start">
                    <h1 className="text-4xl mb-4">{t('deps-update-title')}</h1>
                </div>
                <p>{t('deps-update-text-1')}</p>
                <div className="flex justify-evenly mt-8 mb-8">
                    {updateAvailable.mpv && <div className="flex flex-col justify-center items-center">
                        <code>mpv</code>
                        <code>{depsVersions!.mpv_cur} --&gt; {depsVersions!.mpv_newest}</code>
                    </div>}
                    {updateAvailable.yt_dlp && <div className="flex flex-col justify-center items-center">
                        <code>yt-dlp</code>
                        <code>{depsVersions!.yt_dlp_cur} --&gt; {depsVersions!.yt_dlp_newest}</code>
                    </div>}
                </div>
                <p className="mb-4">{t('deps-update-text-2')}</p>
                <p>{t('deps-update-text-3')}</p>
                <div className="mt-8 flex justify-around">
                    <BtnSecondary onClick={updateLater}>{t('deps-update-later-btn')}</BtnSecondary>
                    <BtnPrimary onClick={updateNow}>{t('deps-update-do-btn')}</BtnPrimary>
                </div>
            </Card>
        </div>
    )
}

interface UpdateAvailable {
    mpv: boolean,
    yt_dlp: boolean
}