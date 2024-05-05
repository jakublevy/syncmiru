import {ReactElement} from "react";
import {BtnDanger, Clickable, DeleteBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import Delete from "@components/svg/Delete.tsx";

export default function DeleteAccountTableRow(): ReactElement {
    const {t} = useTranslation()
    return (
        <tr>
            <td>{t('user-settings-account-delete-account-label')}</td>
            <td></td>
            <td className="text-right">
                <DeleteBtn className="w-10"/>
                {/*<BtnDanger className="w-44">{t('user-settings-account-delete-btn')}</BtnDanger>*/}
            </td>
        </tr>
    )
}