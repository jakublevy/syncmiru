import {ReactElement, useState} from "react";
import {useTranslation} from "react-i18next";
import {CloseBtn} from "@components/widgets/Button.tsx";
import {navigateToMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";
import AvatarSettings from "@components/user/AvatarSettings.tsx";
import UsernameView from "@components/user/UsernameView.tsx";
import DisplaynameSettings from "@components/user/DisplaynameSettings.tsx";
import EmailSettings from "@components/user/EmailSettings.tsx";
import DeleteAccount from "@components/user/DeleteAccount.tsx";
import Loading from "@components/Loading.tsx";
import PasswordSettings from "@components/user/PasswordSettings.tsx";
import Signout from "@components/user/Signout.tsx";

export default function Account(): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const [usernameLoading, setUsernameLoading] = useState<boolean>(true)
    const [passwordChangeLoading, setPasswordChangeLoading] = useState<boolean>(false)
    const [avatarLoading, setAvatarLoading] = useState<boolean>(true)
    const [displaynameLoading, setDisplaynameLoading] = useState<boolean>(true)
    const [emailLoading, setEmailLoading] = useState<boolean>(true)
    const [deleteAccountLoading, setDeleteAccountLoading] = useState<boolean>(true)
    const [signoutLoading, setSignoutLoading] = useState<boolean>(false)

    function showContent() {
        return !usernameLoading
            &&
            !displaynameLoading
            && !emailLoading
            && !avatarLoading
            && !passwordChangeLoading
            && !deleteAccountLoading
            && !signoutLoading
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
                    <Signout
                        setLoading={(b: boolean) => setSignoutLoading(b)}
                    />
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