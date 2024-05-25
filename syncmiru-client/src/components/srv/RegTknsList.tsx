import React, {ReactElement, useState} from "react";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {WarningBanner} from "@components/widgets/Banner.tsx";
import RegTknCreate from "@components/srv/RegTknCreate.tsx";
import RegTknsTable from "@components/srv/RegTknTable.tsx";
import {RegTkn, RegTknType} from "@models/srv.ts";
import {useTranslation} from "react-i18next";
import {useLocation} from "wouter";
import Loading from "@components/Loading.tsx";

export default function RegTknsList(p: Props): ReactElement {
    const {t} = useTranslation();
    const [_, navigate] = useLocation()
    const [activeRegTknsLoading, setActiveRegTknsLoading] = useState<boolean>(true)
    const [inactiveRegTknsLoading, setInactiveRegTknsLoading] = useState<boolean>(true)
    const [newRegTknLoading, setNewRegTknLoading] = useState<boolean>(false)

    function showContent() {
        return !activeRegTknsLoading && !inactiveRegTknsLoading && !newRegTknLoading
    }

    return (
        <>
            {!showContent() &&
                <div className="flex justify-center items-center h-full">
                    <Loading/>
                </div>
            }
            <div className={`flex flex-col ${!showContent() ? 'hidden' : ''}`}>
                <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('reg-tkns-list-title')}</h1>
                    <div className="flex-1"></div>
                    <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
                </div>
                {p.regPubAllowed && <div className="ml-8 mr-8">
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
                <div className="flex flex-col ml-8 mr-8 mb-8 mt-4 gap-y-4">
                    <h2 className="text-xl font-semibold">{t('reg-tkns-list-active-title')}</h2>
                    <RegTknsTable
                        viewDetail={(regTkn) => p.viewDetail(regTkn, RegTknType.Active)}
                        regTknType={RegTknType.Active}
                        setLoading={(b) => setActiveRegTknsLoading(b)}
                    />
                </div>
                <div className="flex flex-col m-8 gap-y-2">
                    <h2 className="text-xl font-semibold">{t('reg-tkns-list-inactive-title')}</h2>
                    <RegTknsTable
                        viewDetail={(regTkn) => p.viewDetail(regTkn, RegTknType.Inactive)}
                        regTknType={RegTknType.Inactive}
                        setLoading={(b) => setInactiveRegTknsLoading(b)}
                    />
                </div>
            </div>
        </>
    )
}

interface Props {
    regPubAllowed: boolean
    viewDetail: (regTkn: RegTkn, regTknType: RegTknType) => void
}