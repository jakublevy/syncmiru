import {ReactElement} from "react";
import {Clickable} from "@components/widgets/Button.tsx";
import Plus from "@components/svg/Plus.tsx";

export default function AddToPlaylistBtn(): ReactElement {
    return (
        <Clickable className="p-2 ml-1">
            <Plus className="h-7 w-min"/>
        </Clickable>
    )
}