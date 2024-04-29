import {ReactElement} from "react";
import {Clickable, CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "../../utils/navigate.ts";
import {useLocation} from "wouter";
import Pc from "@components/svg/Pc.tsx";
import Delete from "@components/svg/Delete.tsx";

export default function Devices(): ReactElement {
    const [_, navigate] = useLocation()
    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">Zařízení</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
            <div className="m-8">
                <h2 className="text-xl font-semibold">Aktuální zařízení</h2>
                <div className="flex mt-4">
                    <Pc className="w-8 mr-2"/>
                    <p>Jakub-Desktop</p>
                    <p>・Windows</p>
                </div>
            </div>
            <div className="m-8">
                <h2 className="text-xl font-semibold">Další zařízení</h2>
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
            </div>
        </div>
    )
}