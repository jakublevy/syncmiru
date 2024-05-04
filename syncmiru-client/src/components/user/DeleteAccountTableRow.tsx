import {ReactElement} from "react";
import {BtnDanger} from "@components/widgets/Button.tsx";

export default function DeleteAccountTableRow(): ReactElement {
    return (
        <>
            <td>Zrušit účet</td>
            <td></td>
            <td className="text-right"><BtnDanger className="w-40">Zrušit účet</BtnDanger></td>
        </>
    )
}