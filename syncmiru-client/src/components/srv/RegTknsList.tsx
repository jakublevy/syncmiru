import {ReactElement} from "react";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";

export default function RegTknsList(): ReactElement {
    const [location, navigate] = useLocation()
    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">Registrační tokeny – přehled</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
        </div>
    )
}