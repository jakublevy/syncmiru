import {DepsState} from "../models/config.tsx";
import Check from "./svg/Check.tsx";
import Cross from "./svg/Cross.tsx";
import {useTranslation} from "react-i18next";
import Previous from "./svg/Previous.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {refresh} from "@mittwald/react-use-promise";
import {ReactElement} from "react";

export default function DepsMissingWindows({firstRunSeen, depsState}: { firstRunSeen: boolean, depsState: DepsState }): ReactElement {
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
                    <button className="rounded-full hover:bg-gray-300 dark:hover:bg-gray-600" onClick={navigateBack}>
                        <Previous height="3rem"/>
                    </button>
                    <h1 className="text-4xl ml-4 mb-4">{t('missing-deps-title')}</h1>
                </div>
                <p>{t('missing-deps-windows-p1')}</p>
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
                <p className="mb-4">{t('missing-deps-windows-p2')}</p>
                <p>{t('missing-deps-windows-p3')}</p>
                <div className="mt-8 flex justify-around">
                    <button className="btn-secondary" onClick={checkDepsAgain}>{t('missing-deps-check-again')}</button>
                    <button className="btn-primary">{t('missing-deps-download-windows')}</button>
                </div>
            </div>
        </div>
    )
}