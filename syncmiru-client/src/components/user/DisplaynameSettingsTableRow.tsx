import {ReactElement} from "react";
import {BtnSecondary} from "@components/widgets/Button.tsx";

export default function DisplaynameSettingsTableRow(): ReactElement {
    return (
        <>
            <td>Zobrazené jméno</td>
            <td className="font-bold">Yadari</td>
            <td className="text-right"><BtnSecondary className="w-40">Změnit</BtnSecondary></td>
        </>
    )
}