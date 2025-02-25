import {ReactElement, Suspense, useEffect} from "react";
import {NavLink} from "@components/widgets/Button.tsx";
import Card from "@components/widgets/Card.tsx";
import {useLocation} from "wouter";
import Account from "@components/user/Account.tsx";
import Appearance from "@components/user/Appearance.tsx";
import {navigateToUserSettingsAppearance} from "src/utils/navigate.ts";
import {useTranslation} from "react-i18next";
import Devices from "@components/user/Devices.tsx";
import About from "@components/user/About.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import Loading from "@components/Loading.tsx";

export default function UserSettings(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
    const {setSettingsShown} = useMainContext()

    useEffect(() => {
        setSettingsShown(true)
        return () => { setSettingsShown(false) }
    }, []);

    function isActive(link: Link) {
        return location === link
    }

    return (
        <Card className="flex h-[calc(100dvh-1.5rem)] m-3 p-0.5">
            <div className="min-w-40 w-40">
                <div className="h-16"></div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate(Link.Account)}
                        active={isActive(Link.Account)}
                        className="w-full text-left p-1">
                        {t('user-settings-nav-account')}
                    </NavLink>
                </div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigateToUserSettingsAppearance(navigate)}
                        active={isActive(Link.Appearance)}
                        className="w-full text-left p-1">
                        {t('user-settings-nav-appearance')}
                    </NavLink>
                </div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate(Link.Devices)}
                        active={isActive(Link.Devices)}
                        className="w-full text-left p-1">
                        {t('user-settings-nav-devices')}
                    </NavLink>
                </div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate(Link.About)}
                        active={isActive(Link.About)}
                        className="w-full text-left p-1">
                        {t('user-settings-nav-about')}
                    </NavLink>
                </div>
                <div className="h-16"></div>
            </div>
            <div className="border-l border-gray-200 dark:border-gray-700 w-[38rem] overflow-auto">
                <Suspense fallback={
                    <div className="flex h-[calc(100dvh-2rem)] items-center justify-center">
                        <Loading/>
                    </div>
                }>
                    {isActive(Link.Account) && <Account/>}
                    {isActive(Link.Appearance) && <Appearance/>}
                    {isActive(Link.Devices) && <Devices/>}
                    {isActive(Link.About) && <About/>}
                </Suspense>
            </div>
        </Card>
    )
}

enum Link {
    Account = "/main/user-settings/account",
    Appearance = "/main/user-settings/appearance",
    Devices = "/main/user-settings/devices",
    About = "/main/user-settings/about",
}