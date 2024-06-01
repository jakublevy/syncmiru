import {ReactElement} from "react";
import {NavLink} from "@components/widgets/Button.tsx";
import Card from "@components/widgets/Card.tsx";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import RoomSyncSettings from "@components/rooms/RoomSyncSettings.tsx";
import RoomGeneralSettings from "@components/rooms/RoomGeneralSettings.tsx";
import {useHistoryState} from 'wouter/use-browser-location'
import {RoomSettingsHistoryState} from "@models/historyState.ts";

export default function RoomSettings(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
    const {rid} = useHistoryState<RoomSettingsHistoryState>()

    function isActive(link: Link) {
        return location === link
    }

    return (
        <Card className="flex h-[calc(100dvh-1.5rem)] m-3 p-0.5">
            <div className="min-w-40 w-40">
                <div className="h-16"></div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate<RoomSettingsHistoryState>(Link.General, {state: {rid: rid}})}
                        active={isActive(Link.General)}
                        className="w-full text-left p-1">
                        {t('room-settings-nav-general')}
                    </NavLink>
                </div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate<RoomSettingsHistoryState>(Link.Sync, {state: {rid: rid}})}
                        active={isActive(Link.Sync)}
                        className="w-full text-left p-1">
                        {t('room-settings-nav-sync')}
                    </NavLink>
                </div>
                <div className="h-16"></div>
            </div>
            <div className="border-l border-gray-200 dark:border-gray-700 w-[38rem] overflow-auto">
                {isActive(Link.General) && <RoomGeneralSettings/>}
                {isActive(Link.Sync) && <RoomSyncSettings/>}
            </div>
        </Card>
    )
}

enum Link {
    General = "/main/room-settings/general",
    Sync = "/main/room-settings/sync",
}