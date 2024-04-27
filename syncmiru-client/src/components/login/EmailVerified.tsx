import {ReactElement, useEffect} from "react";
import Card from "@components/widgets/Card.tsx";
import Party from "@components/svg/Party.tsx";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";

export default function EmailVerified(): ReactElement {
    const {t} = useTranslation()
    const [_, navigate] = useLocation()

    useEffect(() => {
        setTimeout(() => {
            navigateToLoginFormMain(navigate)
        }, 3000)
    }, []);

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="w-[29rem] m-3 p-6">
                <div className="flex items-start">
                    <h1 className="text-4xl mb-4 mr-4">{t('email-verified-title')}</h1>
                    <Party className="min-w-12 w-12"/>
                </div>
                <p>{t('email-verified-content')}</p>
            </Card>
        </div>
    )
}