import {ChangeEvent, ReactElement, useEffect, useRef, useState} from "react";
import {BtnPrimary, BtnSecondary, EditBtn} from "@components/widgets/Button.tsx";
import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {ModalWHeader} from "@components/widgets/Modal.tsx";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {EmailInputSrvValidate, Input} from "@components/widgets/Input.tsx";
import Joi from "joi";
import {useForm} from "react-hook-form";
import {joiResolver} from "@hookform/resolvers/joi";
import {emailValidate, tknValidate} from "src/form/validators.ts";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";
import {
    showPersistentErrorAlert,
    showTemporalErrorAlertForModal,
    showTemporalSuccessAlertForModal
} from "src/utils/alert.ts";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {EmailChangeTkn, EmailChangeTknType} from "@models/user.ts";

export default function EmailSettings(p: Props): ReactElement {
    const {t} = useTranslation()
    const lang = useLanguage()
    const [openSetNewEmailModal, setOpenSetNewEmailModal]
        = useState<boolean>(false)
    const [openVerifyEmailsModal, setOpenVerifyEmailsModal] = useState<boolean>(false)
    const {socket} = useMainContext()
    const [email, setEmail] = useState<string>("")
    const [newEmail, setNewEmail] = useState<string>("")
    const [emailUnique, setEmailUnique] = useState<boolean>(true)
    const [emailLoading, setEmailLoading] = useState<boolean>(true)
    const [resendTimeLoading, setResendTimeLoading] = useState<boolean>(true)
    const resendTimeoutDefault = useRef<number>(60)
    const [resendTimeout, setResendTimeout] = useState<number>(resendTimeoutDefault.current)
    const [tknFrom, setTknFrom] = useState<string>('')
    const [tknFromValid, setTknFromValid] = useState<boolean>(false)
    const [tknFromCheckFailed, setTknFromCheckFailed] = useState<boolean>(false)
    const [tknFromShowError, setTknFromShowError] = useState<boolean>(false)
    const [tknTo, setTknTo] = useState<string>('')
    const [tknToValid, setTknToValid] = useState<boolean>(false)
    const [tknToCheckFailed, setTknToCheckFailed] = useState<boolean>(false)
    const [tknToShowError, setTknToShowError] = useState<boolean>(false)
    const formSchema = Joi.object({
        email: Joi
            .string()
            .required()
            .messages({"string.empty": t('required-field-error')})
            .custom((v: string, h) => {
                if(!emailValidate(v))
                    return h.message({custom: t('email-invalid-format')})
                if(v === email)
                    return h.message({custom: t('email-currently-using')})
                return v
            })
    })

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors}
    } = useForm<FormFields>({resolver: joiResolver(formSchema)});

    useEffect(() => {
        if (socket !== undefined) {
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

    useEffect(() => {
        if(tknFromValid && tknToValid) {
            setOpenVerifyEmailsModal(false)
            p.setLoading(true)
            socket!.emitWithAck("change_email", {
                tkn_from: tknFrom,
                tkn_to: tknTo,
                email_new: newEmail,
                lang: lang
            })
                .then((ack: SocketIoAck<null>) => {
                    if(ack.status === SocketIoAckType.Err)
                        showPersistentErrorAlert(t('modal-change-email-change-failed'))
                    else
                        setEmail(newEmail)
                })
                .catch(() => {
                    showPersistentErrorAlert(t('modal-change-email-change-failed'))
                })
                .finally(() => {
                    p.setLoading(false)
                })
        }
    }, [tknFromValid, tknToValid]);

    function changeEmail(data: FormFields) {
        if(!emailUnique)
            return;

        resetEmailVerificationModal()
        setNewEmail(data.email)
        setOpenSetNewEmailModal(false)
        setOpenVerifyEmailsModal(true)
        socket!.emitWithAck("send_email_change_verification_emails", {email: data.email, lang: lang})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Err) {
                    showTemporalErrorAlertForModal(t('modal-emails-send-error'))
                    setResendTimeout(0)
                }
                else
                    setResendTimeout(resendTimeoutDefault.current)
            })
            .catch(() => {
                showTemporalErrorAlertForModal(t('modal-emails-send-error'))
                setResendTimeout(0)
            })
            .finally(() => {
                setOpenVerifyEmailsModal(true)
                p.setLoading(false)
            })
    }

    function emailUniqueChanged(unique: boolean) {
        setEmailUnique(unique)
    }

    function editClicked() {
        setEmailUnique(true)
        reset({email: email})
        setOpenSetNewEmailModal(true)
    }

    async function checkTkn(tkn: string, tknType: EmailChangeTknType): Promise<boolean> {
        if(!tknValidate(tkn))
            return false

        return socket!.emitWithAck("check_email_change_tkn", { tkn_type: tknType, tkn: tkn } as EmailChangeTkn)
            .then((ack: SocketIoAck<boolean>) => {
                if(tknType === EmailChangeTknType.From)
                    setTknFromCheckFailed(false)
                else
                    setTknToCheckFailed(false)

                if(ack.status === SocketIoAckType.Ok)
                    return ack.payload as boolean
                return false
            })
            .catch(() => {
                if(tknType === EmailChangeTknType.From)
                    setTknFromCheckFailed(true)
                else
                    setTknToCheckFailed(true)

                return false
            })
    }

    function resetEmailVerificationModal() {
        setTknFrom('')
        setTknFromShowError(false)
        setTknFromValid(false)
        setTknTo('')
        setTknToShowError(false)
        setTknToValid(false)
    }

    function resendEmails() {
        setOpenVerifyEmailsModal(false)
        p.setLoading(true)

        resetEmailVerificationModal()

        socket!.emitWithAck("send_email_change_verification_emails", {email: newEmail, lang: lang})
            .then((ack: SocketIoAck<null>) => {
                if(ack.status === SocketIoAckType.Ok) {
                    showTemporalSuccessAlertForModal(t('modal-change-email-resend-success'))
                    setResendTimeout(resendTimeoutDefault.current)
                }
                else {
                    showTemporalErrorAlertForModal(t('modal-emails-send-error'))
                    setResendTimeout(0)
                }
            })
            .catch(() => {
                showTemporalErrorAlertForModal(t('modal-emails-send-error'))
                setResendTimeout(0)
            })
            .finally(() => {
                setOpenVerifyEmailsModal(true)
                p.setLoading(false)
            })
    }

    async function tknFromChanged(e: ChangeEvent<HTMLInputElement>) {
        const tkn = e.target.value
        setTknFrom(tkn)
        const valid = await checkTkn(tkn, EmailChangeTknType.From)
        setTknFromValid(valid)
        setTknFromShowError(!valid && tkn.length > 0)
    }

    async function tknToChanged(e: ChangeEvent<HTMLInputElement>) {
        const tkn = e.target.value
        setTknTo(tkn)
        const valid = await checkTkn(tkn, EmailChangeTknType.To)
        setTknToValid(valid)
        setTknToShowError(!valid && tkn.length > 0)
    }

    return (
        <>
            <div className="flex items-center">
                <p className="w-56">{t('user-settings-account-email-label')}</p>
                <p className="font-bold">{email}</p>
                <div className="flex-1"></div>
                <EditBtn className="w-10" onClick={editClicked}/>
            </div>
            <ModalWHeader
                title={t('modal-change-email-title-1')}
                open={openSetNewEmailModal}
                setOpen={setOpenSetNewEmailModal}
                content={
                    <form onSubmit={handleSubmit(changeEmail)} noValidate>
                        <div className="flex justify-between">
                            <Label htmlFor="displayname">{t('email-label')}</Label>
                            <Help
                                tooltipId="email-help"
                                className="w-4"
                                content={t('modal-change-email-help')}
                            />
                        </div>
                        <EmailInputSrvValidate
                            id="email"
                            onSrvValidationChanged={emailUniqueChanged}
                            required
                            {...register('email')}
                        />
                        {errors.email
                            ? <p className="text-danger font-semibold">{errors.email.message}</p>
                            : <>
                                {!emailUnique
                                    ? <p className="text-danger font-semibold">{t('field-already-registered-error')}</p>
                                    : <p className="text-danger invisible font-semibold">L</p>}
                            </>}
                        <hr className="-ml-6 -mr-6 mt-4 mb-4"/>
                        <div className="flex gap-3">
                            <BtnPrimary type="submit">{t('modal-change-action-btn')}</BtnPrimary>
                            <BtnSecondary onClick={() => setOpenSetNewEmailModal(false)}>{t('modal-no-action-btn')}</BtnSecondary>
                        </div>
                    </form>
                }
            />
            <ModalWHeader
                title={t('modal-change-email-title-2')}
                open={openVerifyEmailsModal}
                setOpen={setOpenVerifyEmailsModal}
                content={
                    <>
                        <p className="mb-4">{t('modal-change-email-text-1')} {t('from-temporal')} <b>{email}</b> {t('to-temporal')} <b>{newEmail}</b>. {t('modal-change-email-text-2')}</p>
                        {(!tknFromValid || !tknToValid) && <div className="mb-4">
                            <BtnTimeout text={t('emails-not-received')} timeout={resendTimeout} onClick={resendEmails}/>
                        </div>}
                        <div className="flex gap-8">
                            <div className="mb-3 flex-1">
                                <div className="flex justify-between">
                                    <Label htmlFor="current-email-tkn">{t('modal-change-email-tkn-from-label')}</Label>
                                    <Help
                                        tooltipId="current-email-tkn"
                                        className="w-4"
                                        content={`${t('modal-change-email-tkn-help')} ${email}`}
                                    />
                                </div>
                                <Input
                                    type="text"
                                    value={tknFrom}
                                    readOnly={tknFromValid}
                                    disabled={tknFromValid}
                                    onChange={tknFromChanged}
                                    maxLength={24}
                                />
                                {tknFromCheckFailed
                                    ? <p className="text-danger font-semibold">{t('tkn-check-failed')}</p>
                                    : <> {tknFromShowError
                                        ? <p className="text-danger font-semibold">{t('tkn-invalid')}</p>
                                        : <>{tknFromValid
                                            ? <p className="text-success font-semibold">{t('tkn-valid')}</p>
                                            : <p className="text-danger invisible font-semibold">L</p>
                                        }</>
                                    } </>
                                }
                            </div>
                            <div className="mb-3 flex-1">
                                <div className="flex justify-between">
                                    <Label htmlFor="current-email-tkn">{t('modal-change-email-tkn-to-label')}</Label>
                                    <Help
                                        tooltipId="current-email-tkn"
                                        className="w-4"
                                        content={`${t('modal-change-email-tkn-help')} ${newEmail}`}
                                    />
                                </div>
                                <Input
                                    type="text"
                                    value={tknTo}
                                    readOnly={tknToValid}
                                    disabled={tknToValid}
                                    onChange={tknToChanged}
                                    maxLength={24}
                                />
                                {tknToCheckFailed
                                    ? <p className="text-danger font-semibold">{t('tkn-check-failed')}</p>
                                    : <> {tknToShowError
                                        ? <p className="text-danger font-semibold">{t('tkn-invalid')}</p>
                                        : <>{tknToValid
                                            ? <p className="text-success font-semibold">{t('tkn-valid')}</p>
                                            : <p className="text-danger invisible font-semibold">L</p>
                                        }</>
                                    } </>
                                }
                            </div>
                        </div>
                    </>
                }
            />
        </>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}

interface FormFields {
    email: string
}