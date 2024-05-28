import {ReactElement} from "react";
import {useLocation} from "wouter";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";

export default function DefaultRoom(): ReactElement {
    const [_, navigate] = useLocation()
    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">Výchozí nastavení místností</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
        </div>
    )
}