import {ReactElement, useState} from "react";
import {useTranslation} from "react-i18next";
import {BtnSecondary, CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToLoginFormMain, navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import useClearJwt from "@hooks/useClearJwt.ts";
import {useMainContext} from "@hooks/useMainContext.ts";
import AvatarSettingsTableRow from "@components/user/AvatarSettingsTableRow.tsx";
import UsernameTableRow from "@components/user/UsernameTableRow.tsx";
import DisplaynameSettingsTableRow from "@components/user/DisplaynameSettingsTableRow.tsx";
import EmailSettingsTableRow from "@components/user/EmailSettingsTableRow.tsx";
import DeleteAccountTableRow from "@components/user/DeleteAccountTableRow.tsx";
import Loading from "@components/Loading.tsx";

export default function Account(): ReactElement {
    const [_, navigate] = useLocation()
    const {socket} = useMainContext()
    const {t} = useTranslation()
    const clearJwt = useClearJwt()
    const [usernameLoading, setUsernameLoading] = useState<boolean>(true)
    //const [avatarLoading, setAvatarLoading] = useState<boolean>(true)
    const [displaynameLoading, setDisplaynameLoading] = useState<boolean>(true)
    const [emailLoading, setEmailLoading] = useState<boolean>(true)

    function signOutClicked() {
        clearJwt().then(() => {
            socket!.emit("sign_out")
            navigateToLoginFormMain(navigate)
        })
    }

    function showContent() {
        return !usernameLoading && !displaynameLoading && !emailLoading
    }

    return (
        <>
        {!showContent() &&
        <div className="flex justify-center items-center h-full">
            <Loading/>
        </div>
        }

        <div className={`flex flex-col ${showContent() ? '' : 'hidden'}`}>
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('user-settings-account-title')}</h1>
                <div className="flex-1"></div>
                <CloseBtn onClick={() => navigateToMain(navigate)}></CloseBtn>
            </div>
            <div className="ml-8 mr-8">
                <BtnSecondary onClick={signOutClicked}>{t('user-settings-account-sign-out-btn')}</BtnSecondary>
            </div>
            <table className="ml-8 mr-8 border-separate border-spacing-y-6">
                <tbody>
                <UsernameTableRow onUsernameLoaded={() => setUsernameLoading(false)}/>
                <AvatarSettingsTableRow/>
                <DisplaynameSettingsTableRow onDisplaynameLoaded={() => setDisplaynameLoading(false)}/>
                <EmailSettingsTableRow onEmailLoaded={() => setEmailLoading(false)}/>
                </tbody>
            </table>

            <hr/>
            <table className="ml-8 mr-8 mt-8">
                <tbody>
                <DeleteAccountTableRow/>
                </tbody>
            </table>
        </div>
        </>
    )
}