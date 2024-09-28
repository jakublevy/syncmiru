import {ReactElement, useEffect} from "react";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import Card from "@components/widgets/Card.tsx";
import {NavLink} from "@components/widgets/Button.tsx";
import Syncmiru from "@components/lic/Syncmiru.tsx";
import Acknowledgements from "@components/lic/Acknowledgements.tsx";
import Licenses from "@components/lic/Licenses.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";
import i18n from "src/i18n.ts";

export default function LicenseMain(): ReactElement {
    const [location, navigate] = useLocation()
    const lang = useLanguage()
    const {t} = useTranslation()

    function isActive(link: Link) {
        return location === link
    }

    useEffect(() => {
        i18n.changeLanguage(lang)
    }, [lang]);

    useEffect(() => {
        navigate('/syncmiru')
    }, []);

    return (
        <Card className="flex h-[calc(100dvh-1.5rem)] m-3 p-0.5">
            <div className="min-w-40 w-40">
                <div className="h-16"></div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate(Link.Syncmiru)}
                        active={isActive(Link.Syncmiru)}
                        className="w-full text-left p-1">
                        {t('license-nav-syncmiru')}
                    </NavLink>
                </div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate(Link.Acknowledgements)}
                        active={isActive(Link.Acknowledgements)}
                        className="w-full text-left p-1">
                        {t('license-nav-acknowledgements')}
                    </NavLink>
                </div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate(Link.Licenses)}
                        active={isActive(Link.Licenses)}
                        className="w-full text-left p-1">
                        {t('license-nav-licenses')}
                    </NavLink>
                </div>
                <div className="h-16"></div>
            </div>
            <div className="border-l border-gray-200 dark:border-gray-700 w-[42rem] overflow-auto">
                {isActive(Link.Syncmiru) && <Syncmiru/>}
                {isActive(Link.Acknowledgements) && <Acknowledgements/>}
                {isActive(Link.Licenses) && <Licenses/>}
            </div>
        </Card>
    )
}

enum Link {
    Syncmiru = "/syncmiru",
    Acknowledgements = "/copyright",
    Licenses = "/licenses",
}