import {ReactElement, useState} from "react";
import {BtnSecondary} from "@components/widgets/Button.tsx";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import {useTranslation} from "react-i18next";
import useClearJwt from "@hooks/useClearJwt.ts";
import {useMainContext} from "@hooks/useMainContext.ts";
import {useLocation} from "wouter";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";

export default function Signout(p: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const {socket} = useMainContext()
    const [showSignoutModal, setShowSignoutModal] = useState<boolean>(false);
    const clearJwt = useClearJwt()

    function btnClicked() {
        setShowSignoutModal(true)
    }

    function signoutClicked() {
        p.setLoading(true)
        clearJwt().then(() => {
            navigateToLoginFormMain(navigate)
        })
    }

    function signoutAndForgetClicked() {
        p.setLoading(true)
        clearJwt().then(() => {
            socket!.emit("sign_out")
            navigateToLoginFormMain(navigate)
        })
    }

    return (
        <>
            <BtnSecondary
                onClick={btnClicked}>{t('sign-out')}</BtnSecondary>
            <ModalWHeader
                title={t('sign-out')}
                open={showSignoutModal}
                setOpen={setShowSignoutModal}
                content={
                    <div>
                        <p>{t('modal-signout-text')}</p>
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnSecondary onClick={signoutClicked}>{t('sign-out')}</BtnSecondary>
                            <BtnSecondary onClick={signoutAndForgetClicked}>{t('modal-signout-forget-btn')}</BtnSecondary>
                        </div>
                    </div>
                }
            />
        </>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}