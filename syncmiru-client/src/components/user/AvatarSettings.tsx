import DefaultAvatar from "@components/svg/DefaultAvatar.tsx";
import {EditBtn} from "@components/widgets/Button.tsx";
import {ReactElement} from "react";
import {useTranslation} from "react-i18next";

export default function AvatarSettings(): ReactElement {
    const {t} = useTranslation()

    function editClicked() {
        console.log("TODO")
    }

    return (
        <div className="flex items-center">
            <p className="w-56">{t('user-settings-account-avatar-label')}</p>
            <DefaultAvatar className="w-14"/>
            <div className="flex-1"></div>
            <EditBtn className="w-10" onClick={editClicked}/>
        </div>
    )
}