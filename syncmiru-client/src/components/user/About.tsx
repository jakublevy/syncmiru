import {ReactElement, Suspense} from "react";
import {BtnTextPrimary, CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import {SYNCMIRU_VERSION} from "src/utils/constants.ts";
import {useDepsState} from "@hooks/useDepsState.ts";
import {invoke} from "@tauri-apps/api/core";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import Loading from "@components/Loading.tsx";

export default function About(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const depsState = useDepsState()

    function viewLicenseClicked() {
        invoke('open_license_window', {})
            .catch(() => {
                showPersistentErrorAlert(t('user-settings-about-open-license-window-error'))
            })
    }

    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('user-settings-about-title')}</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                <div className="flex items-center">
                    <p className="w-56">{t('user-settings-about-version-label')}</p>
                    <p className="font-bold">Syncmiru {SYNCMIRU_VERSION}</p>
                </div>
            </div>
            <div className="m-8">
                <h2 className="text-xl font-semibold">{t('user-settings-about-deps-title')}</h2>
                <div className="flex flex-col mt-6 gap-y-6">
                    <div className="flex items-center">
                        <p className="w-56">{t('user-settings-about-deps-managed-title')}</p>
                        <p className="font-bold">{depsState.managed ? t('user-settings-about-deps-managed-true') : t('user-settings-about-deps-managed-false')}</p>
                    </div>
                    <div className="flex items-center">
                        <p className="w-56">{t('user-settings-about-deps-mpv-version')}</p>
                        <p className="font-bold">{depsState.mpv_ver}</p>
                    </div>
                    <div className="flex items-center">
                        <p className="w-56">{t('user-settings-about-deps-yt-dlp-version')}</p>
                        <p className="font-bold">{depsState.yt_dlp_ver}</p>
                    </div>
                </div>
            </div>
            <hr/>
            <div className="ml-8 mr-8 mt-8 mb-4">
                <BtnTextPrimary
                    onClick={viewLicenseClicked}
                >{t('user-settings-about-view-license')}</BtnTextPrimary>
            </div>
        </div>
    )
}