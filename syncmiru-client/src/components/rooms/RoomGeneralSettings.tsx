import {ReactElement} from "react";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";

export default function RoomGeneralSettings(): ReactElement {
    const [_, navigate] = useLocation()
    const {rooms} = useMainContext()
    const {t} = useTranslation()

    function showContent() {
        return true
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
                    <h1 className="text-2xl font-bold">{t('room-settings-general-title')}</h1>
                    <div className="flex-1"></div>
                    <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
                </div>
            </div>
        </>
    )
}
