import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {BtnSecondary} from "@components/widgets/Button.tsx";
import {ReactElement} from "react";

export default function AvatarSettingsTableRow(): ReactElement {
    return (
        <>
            <td>Avatar</td>
            <td className="text-center font-bold">
                <DefaultAvatar className="w-14"/>
            </td>
            <td className="text-right"><BtnSecondary className="w-40">Změnit</BtnSecondary></td>
        </>
    )
}