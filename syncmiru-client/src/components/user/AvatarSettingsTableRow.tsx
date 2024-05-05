import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {EditBtn} from "@components/widgets/Button.tsx";
import {ReactElement} from "react";
import {useTranslation} from "react-i18next";

export default function AvatarSettingsTableRow(): ReactElement {
    const {t} = useTranslation()
    return (
        <tr>
            <td>{t('user-settings-account-avatar-label')}</td>
            <td className="text-center font-bold">
            <DefaultAvatar className="w-14"/>
            </td>
            <td className="text-right">
                <EditBtn className="w-10"/>
            </td>
        </tr>
    )
}