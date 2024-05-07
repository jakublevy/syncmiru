import {ReactElement, useEffect, useRef, useState} from "react";
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
import {emailValidate} from "src/form/validators.ts";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";
import {StatusAlertService} from "react-status-alert";

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

            socket.emitWithAck("get_my_email")
                .then((email) => setEmail(email))
                .catch(() => setEmail("N/A"))
                .finally(() => setEmailLoading(false))
        }
    }, [socket]);

    useEffect(() => {
        if(!emailLoading && !resendTimeLoading)
            p.onLoaded()
        else
            p.onLoading()
    }, [emailLoading, resendTimeLoading]);

    function changeEmail(data: FormFields) {
        if(!emailUnique)
            return;

        setNewEmail(data.email)
        setOpenSetNewEmailModal(false)
        setOpenVerifyEmailsModal(true)
        socket!.emitWithAck("send_email_change_verification_emails", {email: newEmail, lang: lang})
            .then(() => {})
    }

    function emailUniqueChanged(unique: boolean) {
        setEmailUnique(unique)
    }

    function editClicked() {
        setEmailUnique(true)
        reset({email: email})
        setOpenSetNewEmailModal(true)
    }

    function resendEmails() {
        socket!.emitWithAck("send_email_change_verification_emails", {email: newEmail, lang: lang})
            .then(() => {
                StatusAlertService.showSuccess("Nové emaily byly rozeslány")
                setResendTimeout(resendTimeoutDefault.current)
            })
            .catch(() => {
                showPersistentErrorAlert("Odeslání emailů selhalo, příliš mnoho požadavků v krátkém čase, zkuste to prosím později")
                setResendTimeout(0)
            })
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
                        <p>{t('modal-change-email-text-1')} {t('from-temporal')} <b>{email}</b> {t('to-temporal')} <b>{newEmail}</b>. {t('modal-change-email-text-2')}</p>
                        <div className="mt-4 mb-4">
                            <BtnTimeout text={t('emails-not-received')} timeout={resendTimeout} onClick={resendEmails}/>
                        </div>
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
                                <Input type="text"/>
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
                                <Input type="text"/>
                            </div>
                        </div>
                    </>
                }
            />
        </>
    )
}

interface Props {
    onLoaded: () => void
    onLoading: () => void
}

interface FormFields {
    email: string
}