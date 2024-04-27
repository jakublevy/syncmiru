import {DepsState} from "@models/deps.tsx";
import Check from "@components/svg/Check.tsx";
import Cross from "@components/svg/Cross.tsx";
import {useTranslation} from "react-i18next";
import {refresh} from "@mittwald/react-use-promise";
import {ReactElement} from "react";
import {BackBtn, BtnPrimary, BtnSecondary} from "@components/widgets/Button.tsx";
import {useLocation} from "wouter";
import Card from "@components/widgets/Card.tsx";
import {TrampolineHistoryState, MpvDownloadHistoryState} from "@models/historyState.ts";
import {navigateToWelcome} from "src/utils/navigate.ts";

export default function DepsMissingWindows({firstRunSeen, depsState}: Props): ReactElement {
    const {t} = useTranslation()
    const [location, navigate] = useLocation()

    function navigateBack(): void {
        navigateToWelcome(navigate)
    }

    function checkDepsAgain(): void {
        refresh({tag: "useDepsState"})
        navigate<TrampolineHistoryState>("/reload", {state: {to: location, firstRunSeen: firstRunSeen}})
    }

    function downloadDeps(): void {
        navigate<MpvDownloadHistoryState>('/mpv-download', {state: { yt_dlp: true }})
    }

    return (
        <div className="flex justify-center items-center ml-8 mr-8 mt-3 mb-3">
            <Card className="p-6">
                <div className="flex items-start">
                    {!firstRunSeen && <BackBtn className="mr-4" onClick={navigateBack}/>}
                    <h1 className="text-4xl mb-4">{t('missing-deps-title')}</h1>
                </div>
                <p>{t('missing-deps-msg')}</p>
                <div className="flex justify-evenly mt-8 mb-8">
                    <div className="flex flex-col justify-center items-center">
                        <code>mpv</code>
                        {depsState.mpv
                            ? <Check className="w-4"/>
                            : <Cross className="w-4"/>}
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <code>yt-dlp</code>
                        {depsState.yt_dlp
                            ? <Check className="w-4"/>
                            : <Cross className="w-4"/>}
                    </div>
                </div>
                <p className="mb-4">{t('missing-deps-windows-msg2')}</p>
                <p>{t('missing-deps-windows-msg3')}</p>
                <div className="mt-8 flex justify-around">
                    <BtnSecondary onClick={checkDepsAgain}>{t('missing-deps-check-again')}</BtnSecondary>
                    <BtnPrimary onClick={downloadDeps}>{t('missing-deps-download-windows')}</BtnPrimary>
                </div>
            </Card>
        </div>
    )
}

interface Props {
    firstRunSeen: boolean,
    depsState: DepsState
}