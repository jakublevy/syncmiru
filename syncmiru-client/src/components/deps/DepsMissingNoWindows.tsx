import {DepsState} from "@models/config.tsx";
import Check from "@components/svg/Check.tsx";
import Cross from "@components/svg/Cross.tsx";
import {useTranslation} from "react-i18next";
import {useLocation, useNavigate} from "react-router-dom";
import {refresh} from "@mittwald/react-use-promise";
import {ReactElement} from "react";
import {BackButton, BtnPrimary} from "@components/widgets/Buttons.tsx";

export default function DepsMissingNoWindows({firstRunSeen, depsState}: Props): ReactElement {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()

    function navigateBack(): void {
        refresh({tag: "useLanguage"})
        navigate("/welcome")
    }

    function checkDepsAgain(): void {
        refresh({tag: "useDepsState"})
        if(location.pathname == "/deps")
            navigate("/deps-again", {state: {firstRunSeen: firstRunSeen}})
        else
            navigate("/deps", {state: {firstRunSeen: firstRunSeen}})
    }

    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col p-4 border-4 m-4">
                <div className="flex items-start">
                    {!firstRunSeen && <BackButton className="mr-4" onClick={navigateBack}/>}
                    <h1 className="text-4xl mb-4">{t('missing-deps-title')}</h1>
                </div>
                <p>{t('missing-deps-msg')}</p>
                <div className="flex justify-evenly mt-8 mb-8">
                    <div className="flex flex-col justify-center items-center">
                        <code>mpv</code>
                        {depsState.mpv
                            ? <Check width="1rem" fill="#1c7f21"/>
                            : <Cross width="1rem" fill="#ee1e40"/>}
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <code>yt-dlp</code>
                        {depsState.yt_dlp
                            ? <Check width="1rem" fill="#1c7f21"/>
                            : <Cross width="1rem" fill="#ee1e40"/>}
                    </div>
                </div>
                <p className="mb-4">{t('missing-deps-no-windows-msg2')}</p>
                <code className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">apt-get install mpv yt-dlp</code>
                <div className="mt-8 flex justify-center">
                    <BtnPrimary onClick={checkDepsAgain}>{t('missing-deps-check-again')}</BtnPrimary>
                </div>
            </div>
        </div>
    )
}

interface Props {
    firstRunSeen: boolean,
    depsState: DepsState
}