import React, {ReactElement, useEffect, useState} from "react";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";
import {WarningBanner} from "@components/widgets/Banner.tsx";
import RegTknCreate from "@components/srv/RegTknCreate.tsx";
import {useTranslation} from "react-i18next";
import RegTknsActiveList from "@components/srv/RegTknActiveList.tsx";
import RegTknInactiveList from "@components/srv/RegTknInactiveList.tsx";

export default function RegTknsList(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [regPubFetching, setRegPubFetching] = useState<boolean>(true)
    const [regPubAllowed, setRegPubAllowed] = useState<boolean>(false)
    const [activeRegTknsLoading, setActiveRegTknsLoading] = useState<boolean>(true)
    const [inactiveRegTknsLoading, setInactiveRegTknsLoading] = useState<boolean>(true)
    const [newRegTknLoading, setNewRegTknLoading] = useState<boolean>(false)

    useEffect(() => {
        if (socket !== undefined) {
            socket.emitWithAck("get_reg_pub_allowed")
                .then((regPubAllowed: boolean) => {
                    setRegPubAllowed(regPubAllowed)
                })
                .finally(() => setRegPubFetching(false))
        }
    }, [socket]);


    function showContent() {
        return !regPubFetching && !newRegTknLoading && !activeRegTknsLoading && !inactiveRegTknsLoading
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
                    <h1 className="text-2xl font-bold">{t('reg-tkns-list-title')}</h1>
                    <div className="flex-1"></div>
                    <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
                </div>
                {regPubAllowed && <div className="ml-8 mr-8">
                    <WarningBanner
                        title={t('reg-tkns-list-banner-title')}
                        content={t('reg-tkns-list-banner-text')}
                    />
                </div>}
                <div className="ml-8 mr-8 flex gap-x-4">
                    <RegTknCreate
                        setLoading={(b) => setNewRegTknLoading(b)}
                    />
                </div>
                <div className="flex flex-col ml-8 mr-8 mb-8 mt-4 gap-y-2">
                    <h2 className="text-xl font-semibold">{t('reg-tkns-list-active-title')}</h2>
                    <RegTknsActiveList
                        setLoading={(b) => setActiveRegTknsLoading(b)}
                    />
                </div>
                <div className="flex flex-col m-8 gap-y-2">
                    <h2 className="text-xl font-semibold">{t('reg-tkns-list-inactive-title')}</h2>
                    <RegTknInactiveList
                        setLoading={(b) => setInactiveRegTknsLoading(b)}
                    />
                </div>
            </div>
        </>
    )
}