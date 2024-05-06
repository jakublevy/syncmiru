import {BtnSecondary} from "@components/widgets/Button.tsx";
import {ReactElement} from "react";
import {useTranslation} from "react-i18next";

export default function PasswordSettings(): ReactElement {
    const {t} = useTranslation()
    return (
        <BtnSecondary>Změnit heslo</BtnSecondary>
    )
}