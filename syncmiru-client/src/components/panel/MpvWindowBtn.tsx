import {ReactElement} from "react";
import {Clickable} from "@components/widgets/Button.tsx";
import Eject from "@components/svg/Eject.tsx";

export default function MpvWindowBtn(): ReactElement {
    return (
        <Clickable className="p-2 ml-1">
            <Eject className="h-7"/>
        </Clickable>
    )
}