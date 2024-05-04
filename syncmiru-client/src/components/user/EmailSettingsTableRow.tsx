import {ReactElement} from "react";
import {BtnSecondary} from "@components/widgets/Button.tsx";

export default function EmailSettingsTableRow(): ReactElement {
    return (
        <>
            <td>Email</td>
            <td className="font-bold">test@test.cz</td>
            <td className="text-right"><BtnSecondary className="w-40">Změnit</BtnSecondary></td>
        </>
    )
}