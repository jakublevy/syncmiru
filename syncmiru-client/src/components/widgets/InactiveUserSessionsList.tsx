import {ReactElement} from "react";
import Pc from "@components/svg/Pc.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import Delete from "@components/svg/Delete.tsx";
import {UserSession} from "../../models.ts";

export default function InactiveUserSessionsList({sessions}: Props): ReactElement {
    return (
        <>
            <div className="flex items-center mt-2">
                <Pc className="w-8 mr-2"/>
                <p>Jakub-Desktop</p>
                <p>・Windows</p>
                <div className="flex-1"></div>
                <Clickable className="p-2">
                    <Delete className="w-8"/>
                </Clickable>
            </div>
            <div className="flex items-center mt-2">
                <Pc className="w-8 mr-2"/>
                <p>Jakub-Desktop</p>
                <p>・Windows</p>
                <div className="flex-1"></div>
                <Clickable className="p-2">
                    <Delete className="w-8"/>
                </Clickable>
            </div>
            <div className="flex items-center mt-2">
                <Pc className="w-8 mr-2"/>
                <p>Jakub-Desktop</p>
                <p>・Windows</p>
                <div className="flex-1"></div>
                <Clickable className="p-2">
                    <Delete className="w-8"/>
                </Clickable>
            </div>
        </>
    )
}

interface Props {
    sessions: Array<UserSession>
}