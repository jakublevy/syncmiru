import {ReactElement, useState} from "react";
import {useTranslation} from "react-i18next";
import {BtnSecondary, CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToLoginFormMain, navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import useClearJwt from "@hooks/useClearJwt.ts";
import {useMainContext} from "@hooks/useMainContext.ts";
import AvatarSettings from "@components/user/AvatarSettings.tsx";
import UsernameView from "@components/user/UsernameView.tsx";
import DisplaynameSettings from "@components/user/DisplaynameSettings.tsx";
import EmailSettings from "@components/user/EmailSettings.tsx";
import DeleteAccount from "@components/user/DeleteAccount.tsx";
import Loading from "@components/Loading.tsx";
import PasswordSettings from "@components/user/PasswordSettings.tsx";

export default function Account(): ReactElement {
    const [_, navigate] = useLocation()
    const {socket} = useMainContext()
    const {t} = useTranslation()
    const clearJwt = useClearJwt()
    const [usernameLoading, setUsernameLoading] = useState<boolean>(true)
    const [passwordChangeLoading, setPasswordChangeLoading] = useState<boolean>(false)
    const [avatarLoading, setAvatarLoading] = useState<boolean>(true)
    const [displaynameLoading, setDisplaynameLoading] = useState<boolean>(true)
    const [emailLoading, setEmailLoading] = useState<boolean>(true)
    const [deleteAccountLoading, setDeleteAccountLoading] = useState<boolean>(true)

    function signOutClicked() {
        clearJwt().then(() => {
            socket!.emit("sign_out")
            navigateToLoginFormMain(navigate)
        })
    }

    function showContent() {
        return !usernameLoading && !displaynameLoading && !emailLoading && !avatarLoading && !passwordChangeLoading && !deleteAccountLoading
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
            <div className="ml-8 mr-8 mb-8">
                <div className="flex gap-x-4">
                    <BtnSecondary onClick={signOutClicked}>{t('sign-out-btn')}</BtnSecondary>
                    <PasswordSettings
                        setLoading={(b: boolean) => setPasswordChangeLoading(b)}
                    />
                </div>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                <UsernameView
                    setLoading={(b: boolean) => setUsernameLoading(b)}
                />
                <AvatarSettings
                    setLoading={(b: boolean) => setAvatarLoading(b)}
                />
                <DisplaynameSettings
                    setLoading={(b: boolean) => setDisplaynameLoading(b)}
                />
                <EmailSettings
                    setLoading={(b: boolean) => setEmailLoading(b)}
                />
            </div>

            <hr/>
            <div className="ml-8 mr-8 mt-8">
                <DeleteAccount
                    setLoading={(b: boolean) => setDeleteAccountLoading(b)}
                />
            </div>
        </div>
        </>
    )
}