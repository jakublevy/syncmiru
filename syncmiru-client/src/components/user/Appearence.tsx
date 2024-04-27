import {ReactElement} from "react";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "../../utils/navigate.ts";
import {useLocation} from "wouter";
import LanguageSelector from "@components/widgets/LanguageSelector.tsx";
import ThemeSelector from "@components/widgets/ThemeSelector.tsx";

export default function Appearence(): ReactElement {
    const [_, navigate] = useLocation()
    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">Nastavení vzhledu</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
            <div className="flex flex-col m-8">
                <div className="flex items-center">
                    <p>Jazyk</p>
                    <div className="flex-1"></div>
                    <LanguageSelector/>
                </div>
                <hr className="mt-6"/>
            </div>
            <div className="flex flex-col m-8">
                <div className="flex items-center">
                    <p>Motiv</p>
                    <div className="flex-1"></div>
                    <ThemeSelector/>
                </div>
                <hr className="mt-6"/>
            </div>
        </div>
    )
}