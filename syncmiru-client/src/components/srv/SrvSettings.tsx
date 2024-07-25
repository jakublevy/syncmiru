import {ReactElement, useEffect} from "react";
import {NavLink} from "@components/widgets/Button.tsx";
import Card from "@components/widgets/Card.tsx";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import RegTkns from "@components/srv/RegTkns.tsx";
import DefaultRoom from "@components/srv/DefaultRoom.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";

export default function SrvSettings(): ReactElement {
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
                        onClick={() => navigate(Link.RegTkns)}
                        active={isActive(Link.RegTkns)}
                        className="w-full text-left p-1">
                        {t('srv-settings-nav-reg-tkns')}
                    </NavLink>
                </div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate(Link.Rooms)}
                        active={isActive(Link.Rooms)}
                        className="w-full text-left p-1">
                        {t('srv-settings-nav-rooms')}
                    </NavLink>
                </div>
                <div className="h-16"></div>
            </div>
            <div className="border-l border-gray-200 dark:border-gray-700 w-[38rem] overflow-auto">
                {isActive(Link.RegTkns) && <RegTkns/>}
                {isActive(Link.Rooms) && <DefaultRoom/>}
            </div>
        </Card>
    )
}

enum Link {
    RegTkns = "/main/srv-settings/reg-tkns",
    Rooms = "/main/srv-settings/rooms",
}