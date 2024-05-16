import {ChangeEvent, ReactElement, useEffect, useRef, useState} from "react";
import {BtnDanger, DeleteBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {Input} from "@components/widgets/Input.tsx";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {
    showPersistentErrorAlert,
    showTemporalErrorAlertForModal,
    showTemporalSuccessAlertForModal
} from "src/utils/alert.ts";
import {useLanguage} from "@hooks/useLanguage.ts";
import {tknValidate} from "src/form/validators.ts";
import useClearJwt from "@hooks/useClearJwt.ts";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";
import {useLocation} from "wouter";

export default function DeleteAccount(p: Props): ReactElement {
    const {t} = useTranslation()
    const lang = useLanguage()
    const clearJwt = useClearJwt()
    const [_, navigate] = useLocation()
    const {socket} = useMainContext()
    const [emailLoading, setEmailLoading] = useState<boolean>(true)
    const [resendTimeLoading, setResendTimeLoading] = useState<boolean>(true)
    const resendTimeoutDefault = useRef<number>(60)
    const [resendTimeout, setResendTimeout] = useState<number>(resendTimeoutDefault.current)
    const [email, setEmail] = useState<string>("")
    const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
    const [tkn, setTkn] = useState<string>('')
    const [tknValid, setTknValid] = useState<boolean>(false)
    const [tknCheckFailed, setTknCheckFailed] = useState<boolean>(false)
    const [tknShowError, setTknShowError] = useState<boolean>(false)

    useEffect(() => {
        if(socket !== undefined) {
            socket.emitWithAck("get_email_resend_timeout")
                .then((timeout) => {
                    resendTimeoutDefault.current = timeout
                    setResendTimeout(timeout)
                })
                .finally(() => setResendTimeLoading(false))

            socket.emitWithAck("get_email")
                .then((email) => setEmail(email))
                .catch(() => setEmail("N/A"))
                .finally(() => setEmailLoading(false))
        }
    }, [socket]);

    useEffect(() => {
        if(!emailLoading && !resendTimeLoading)
            p.setLoading(false)
        else
            p.setLoading(true)
    }, [emailLoading, resendTimeLoading]);

    function deleteClicked() {
        setDeleteAccountModalOpen(true)

        socket!.emitWithAck("send_delete_account_email", {lang: lang})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showTemporalErrorAlertForModal(t('modal-email-send-error'))
                    setResendTimeout(0)
                }
                else
                    setResendTimeout(resendTimeoutDefault.current)
            })
            .catch(() => {
                showTemporalErrorAlertForModal(t('modal-email-send-error'))
                setResendTimeout(0)
            })
    }

    function resetDeleteAccountModal() {
        setTkn('')
        setTknShowError(false)
        setTknValid(false)
    }

    function resendEmails() {
        resetDeleteAccountModal()
        setDeleteAccountModalOpen(false)
        p.setLoading(true)

        socket!.emitWithAck("send_delete_account_email", {lang: lang})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showTemporalErrorAlertForModal(t('modal-email-send-error'))
                    setResendTimeout(0)
                }
                else {
                    showTemporalSuccessAlertForModal(t('new-email-has-been-sent-msg'))
                    setResendTimeout(resendTimeoutDefault.current)
                }
            })
            .catch(() => {
                showTemporalErrorAlertForModal(t('modal-email-send-error'))
                setResendTimeout(0)
            })
            .finally(() => {
                p.setLoading(false)
                setDeleteAccountModalOpen(true)
            })
    }

    async function tknChanged(e: ChangeEvent<HTMLInputElement>) {
        const tkn = e.target.value
        setTkn(tkn)
        const valid = await checkTkn(tkn)
        setTknValid(valid)
        setTknShowError(!valid && tkn.length > 0)
    }

    function deleteAccount() {
        p.setLoading(true)
        setDeleteAccountModalOpen(false)
        socket!.emitWithAck("delete_account", {tkn: tkn, lang: lang})
            .then((ack: SocketIoAck<boolean>) => {
                if(ack.status === SocketIoAckType.Ok) {
                    if(!ack.payload) {
                        showPersistentErrorAlert(t('modal-delete-account-tkn-expired-error'))
                        return
                    }
                }
                else {
                    showPersistentErrorAlert(t('modal-delete-account-delete-error'))
                    return
                }

                clearJwt().then(() => {
                    navigateToLoginFormMain(navigate)
                })
                showTemporalSuccessAlertForModal(t('modal-delete-account-delete-success'))
            })
            .catch(() => {
                showPersistentErrorAlert(t('modal-delete-account-delete-error'))
            })
            .finally(() => {
                p.setLoading(false)
            })
    }

    async function checkTkn(tkn: string): Promise<boolean> {
        if(!tknValidate(tkn))
            return false

        return socket!.emitWithAck("check_delete_account_tkn", { tkn: tkn })
            .then((ack: SocketIoAck<boolean>) => {
                setTknCheckFailed(false)
                if(ack.status === SocketIoAckType.Ok)
                    return ack.payload as boolean
                return false
            })
            .catch(() => {
                setTknCheckFailed(true)
                return false
            })
    }

    return (
        <>
            <div className="flex items-center mb-4">
                <p>{t('user-settings-account-delete-account-label')}</p>
                <div className="flex-1"></div>
                <DeleteBtn
                    className="w-10"
                    onClick={deleteClicked}
                />
            </div>
            <ModalWHeader
                title={t('modal-delete-account-title')}
                open={deleteAccountModalOpen}
                setOpen={setDeleteAccountModalOpen}
                content={
                    <div className="flex flex-col">
                        <p className="mb-4">{t('modal-delete-account-text-1')} <b>{email}</b> {t('modal-delete-account-text-2')}</p>
                        {!tknValid && <div className="mb-4">
                            <BtnTimeout text={t('email-not-received')} timeout={resendTimeout} onClick={resendEmails}/>
                        </div>}
                        <div className="mb-3 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="tkn">{t('modal-delete-account-tkn-label')}</Label>
                                <Help
                                    tooltipId="tkn"
                                    className="w-4"
                                    content={t('modal-delete-account-tkn-help')}
                                />
                            </div>
                            <Input
                                type="text"
                                value={tkn}
                                readOnly={tknValid}
                                disabled={tknValid}
                                onChange={tknChanged}
                                maxLength={24}
                            />
                            {tknCheckFailed
                                ? <p className="text-danger font-semibold">{t('tkn-check-failed')}</p>
                                : <> {tknShowError
                                    ? <p className="text-danger font-semibold">{t('tkn-invalid')}</p>
                                    : <>{tknValid
                                        ? <p className="text-success font-semibold">{t('tkn-valid')}</p>
                                        : <p className="text-danger invisible font-semibold">L</p>
                                    }</>
                                } </>
                            }
                        </div>
                        {tknValid && <BtnDanger onClick={deleteAccount}>{t('modal-delete-account-confirm-btn')}</BtnDanger>}
                    </div>
                }
            />
        </>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}