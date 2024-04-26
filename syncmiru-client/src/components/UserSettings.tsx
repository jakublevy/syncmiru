import {ReactElement} from "react";
import {Clickable} from "@components/widgets/Button.tsx";
import Card from "@components/widgets/Card.tsx";

export default function UserSettings(): ReactElement {
    // TODO: udělat přes location a https://github.com/molefrog/wouter?tab=readme-ov-file#how-do-i-make-a-link-active-for-the-current-route
    return (
        <Card className="flex m-6 p-0.5">
            <div className="min-w-40 w-40">
                <div className="h-16"></div>
                <div className="m-1">
                    <Clickable className="w-full text-left p-1">Účty</Clickable>
                </div>
                <div className="m-1">
                    <Clickable className="w-full text-left p-1">Vzhled</Clickable>
                </div>
                <div className="m-1">
                    <Clickable className="w-full text-left p-1">Přehrávač</Clickable>
                </div>
                <div className="m-1">
                    <Clickable className="w-full text-left p-1">Zařízení</Clickable>
                </div>
                <div className="m-1">
                    <Clickable className="w-full text-left p-1">O programu</Clickable>
                </div>
                <div className="h-16"></div>
            </div>
            <div className="border-l w-[40rem] flex justify-center items-center">
                <p>fd</p>
            </div>
        </Card>
    )
}