import {ReactElement} from "react";
import {DeleteBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";

export default function DeleteAccount(): ReactElement {
    const {t} = useTranslation()
    return (
        <div className="flex items-center mb-4">
            <p>{t('user-settings-account-delete-account-label')}</p>
            <div className="flex-1"></div>
            <DeleteBtn className="w-10"/>
        </div>
    )
}