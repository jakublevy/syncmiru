import {ReactElement} from "react";
import DoorOut from "@components/svg/DoorOut.tsx";
import {Btn, SvgBtn} from "@components/widgets/Button.tsx";

export default function JoinedRoom(): ReactElement {
    return (
        <div className="flex justify-between items-center border p-2">
            <div className="flex flex-col">
                <p className="text-xs">Připojen</p>
                <p>Seriály ČT</p>
            </div>
            <SvgBtn onClick={() => {}} className="p-2">
                <DoorOut className="w-7"/>
            </SvgBtn>
        </div>
    )
}