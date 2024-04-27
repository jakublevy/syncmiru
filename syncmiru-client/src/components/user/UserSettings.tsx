import {ReactElement} from "react";
import {Clickable, NavLink} from "@components/widgets/Button.tsx";
import Card from "@components/widgets/Card.tsx";
import {useLocation} from "wouter";
import Account from "@components/user/Account.tsx";
import Appearence from "@components/user/Appearence.tsx";
import {navigateToUserSettingsAppearence} from "../../utils/navigate.ts";

export default function UserSettings(): ReactElement {
    const [location, navigate] = useLocation()

    function isActive(link: Link) {
        return location === link
    }

    return (
        <Card className="flex m-6 p-0.5">
            <div className="min-w-40 w-40">
                <div className="h-16"></div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigate(Link.Account)}
                        active={isActive(Link.Account)}
                        className="w-full text-left p-1">
                        Účet
                    </NavLink>
                </div>
                <div className="m-1">
                    <NavLink
                        onClick={() => navigateToUserSettingsAppearence(navigate)}
                        active={isActive(Link.Appearence)}
                        className="w-full text-left p-1">
                        Vzhled
                    </NavLink>
                </div>
                <div className="m-1">
                    <NavLink className="w-full text-left p-1">Přehrávač</NavLink>
                </div>
                <div className="m-1">
                    <NavLink className="w-full text-left p-1">Zařízení</NavLink>
                </div>
                <div className="m-1">
                    <NavLink className="w-full text-left p-1">O programu</NavLink>
                </div>
                <div className="h-16"></div>
            </div>
            <div className="border-l border-gray-200 dark:border-gray-700 w-[40rem]">
                {isActive(Link.Account) && <Account/>}
                {isActive(Link.Appearence) && <Appearence/>}
            </div>
        </Card>
    )
}

enum Link {
    Account = "/main/user-settings/account",
    Appearence = "/main/user-settings/appearence",
    Player = "/main/user-settings/player",
    Devices = "/main/user-settings/devices",
    About = "/main/user-settings/about",
}