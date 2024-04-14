import {DepsState} from "@models/config.tsx";
import Check from "@components/svg/Check.tsx";
import Cross from "@components/svg/Cross.tsx";
import {useTranslation} from "react-i18next";
import {refresh} from "@mittwald/react-use-promise";
import {ReactElement} from "react";
import {BackButton, BtnPrimary} from "@components/widgets/Button.tsx";
import {useLocation} from "wouter";
import Card from "@components/widgets/Card.tsx";
import {TrampolineHistoryState} from "@models/historyState.ts";

export default function DepsMissingNoWindows({firstRunSeen, depsState}: Props): ReactElement {
    const {t} = useTranslation()
    const [location, navigate] = useLocation()

    function navigateBack(): void {
        refresh({tag: "useLanguage"})
        navigate("/welcome")
    }

    function checkDepsAgain(): void {
        refresh({tag: "useDepsState"})
        navigate("/reload", {state: {to: location, firstRunSeen: firstRunSeen} as TrampolineHistoryState})
    }

    return (
        <div className="flex justify-center items-center ml-8 mr-8 mt-3 mb-3">
            <Card>
                <div className="flex items-start">
                    {!firstRunSeen && <BackButton className="mr-4" onClick={navigateBack}/>}
                    <h1 className="text-4xl mb-4">{t('missing-deps-title')}</h1>
                </div>
                <p>{t('missing-deps-msg')}</p>
                <div className="flex justify-evenly mt-8 mb-8">
                    <div className="flex flex-col justify-center items-center">
                        <code>mpv</code>
                        {depsState.mpv
                            ? <Check className="w-4" fill="#1c7f21"/>
                            : <Cross className="w-4" fill="#ee1e40"/>}
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <code>yt-dlp</code>
                        {depsState.yt_dlp
                            ? <Check className="w-4" fill="#1c7f21"/>
                            : <Cross className="w-4" fill="#ee1e40"/>}
                    </div>
                </div>
                <p className="mb-4">{t('missing-deps-no-windows-msg2')}</p>
                <code className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">apt-get install mpv yt-dlp</code>
                <div className="mt-8 flex justify-center">
                    <BtnPrimary onClick={checkDepsAgain}>{t('missing-deps-check-again')}</BtnPrimary>
                </div>
            </Card>
        </div>
    )
}

interface Props {
    firstRunSeen: boolean,
    depsState: DepsState
}