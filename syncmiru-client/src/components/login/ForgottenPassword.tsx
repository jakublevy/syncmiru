import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import Card from "@components/widgets/Card.tsx";
import BtnTimeout from "@components/widgets/BtnTimeout.tsx";
import Help from "@components/widgets/Help.tsx";
import {ForgottenPasswordTknSrvValidate, Input} from "@components/widgets/Input.tsx";
import {BackBtn, BtnPrimary} from "@components/widgets/Button.tsx";
import {useLocation} from "wouter";
import {useReqForgottenPasswordEmail, useReqForgottenPasswordEmailAgain} from "@hooks/useReqForgottenPasswordEmail.ts";
import Loading from "@components/Loading.tsx";
import Label from "@components/widgets/Label.tsx";
import {NewPasswordFields, useNewPasswordSchema} from "@hooks/useNewPasswordFormSchema.ts";
import {useForm} from "react-hook-form";
import {joiResolver} from "@hookform/resolvers/joi";
import {useLanguage} from "@hooks/useLanguage.ts";
import {useTranslation} from "react-i18next";
import {navigateToLoginFormMain} from "src/utils/navigate.ts";
import {StatusAlertService} from "react-status-alert";
import {
    useForgottenPasswordChangePassword
} from "@hooks/useForgottenPasswordChangePassword.ts";
import {ForgottenPasswordChangeData} from "@models/login.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function ForgottenPassword({email, waitBeforeResend}: Props): ReactElement {
    const [_, navigate] = useLocation()
    const {t} = useTranslation()
    const language = useLanguage()
    const {error: fpError, isLoading: fpIsLoading} = useReqForgottenPasswordEmail(email)
    const reqForgottenPasswordEmailAgain = useReqForgottenPasswordEmailAgain()
    const forgottenPasswordChangePassword = useForgottenPasswordChangePassword()
    const [loading, setLoading] = useState<boolean>(false)
    const [resendTimeout, setResendTimeout] = useState<number>(waitBeforeResend)
    const [tknValid, setTknValid] = useState<boolean>(false)
    const [showTknInvalid, setShowTknInvalid] = useState<boolean>(false)
    const [tknCheckFailed, setTknCheckFailed] = useState<boolean>(false)
    const [tkn, setTkn] = useState<string>("")

    const formSchema = useNewPasswordSchema(t)

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<NewPasswordFields>({resolver: joiResolver(formSchema)});

    useEffect(() => {
        setLoading(fpIsLoading)
    }, [fpIsLoading]);

    useEffect(() => {
        if (fpError !== undefined) {
            showPersistentErrorAlert(fpError)
            setResendTimeout(0)
        } else {
            setResendTimeout(waitBeforeResend)
        }
    }, [fpError]);

    function backButtonClicked() {
        navigateToLoginFormMain(navigate, {email: email})
    }

    function resendEmail() {
        setLoading(true)
        reqForgottenPasswordEmailAgain(email)
            .then(() => {
                setResendTimeout(waitBeforeResend)
                StatusAlertService.showSuccess(t('new-email-has-been-sent-msg'))
                setTkn('')
            })
            .catch((e) => {
                setResendTimeout(0)
                showPersistentErrorAlert(e)
            })
            .finally(() => setLoading(false))
    }

    function tknValidChanged(valid: boolean) {
        setTknCheckFailed(false)
        setShowTknInvalid(!valid && tkn.length > 0)
        setTknValid(valid)
    }

    function tknChanged(e: ChangeEvent<HTMLInputElement>) {
        const tkn = e.target.value
        setTkn(tkn)
        if (tkn.length !== 24)
            setShowTknInvalid(e.target.value.length > 0)
    }

    function tknValidationError(error: string) {
        setTknCheckFailed(true)
    }

    function changePassword(form: NewPasswordFields) {
        const sendData: ForgottenPasswordChangeData = {
            email: email,
            tkn: tkn,
            password: form.password,
            lang: language,
        }
        setLoading(true)
        forgottenPasswordChangePassword(sendData)
            .then(() => {
                navigate('/forgotten-password-changed')
            })
            .catch((e: string) => {
                showPersistentErrorAlert(e)
            })
            .finally(() => setLoading(false))
    }

    if (loading)
        return <Loading/>

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[27rem] w-[40rem] m-3 p-6">
                <div className="flex items-start">
                    <BackBtn onClick={backButtonClicked} className="mr-4"/>
                    <h1 className="text-4xl mb-4">{t('forgotten-password-title')}</h1>
                </div>
                <p>{t('forgotten-password-text-1')} <b>{email}</b> {t('forgotten-password-text-2')}</p>
                {!tknValid && <div className="mt-4 mb-4">
                    <BtnTimeout text={t('email-not-received')} timeout={resendTimeout} onClick={resendEmail}/>
                </div>
                }
                <div className="mt-4">
                    <div className="flex justify-between">
                        <label htmlFor="token" className="block mb-1 text-sm font-medium">{t('forgotten-password-tkn-label')}</label>
                        <Help
                            tooltipId="token-help"
                            className="w-4"
                            content={t('forgotten-password-tkn-help')}
                        />
                    </div>
                    <ForgottenPasswordTknSrvValidate
                        type="text"
                        id="token"
                        value={tkn}
                        readOnly={tknValid}
                        disabled={tknValid}
                        validationArgs={{email: email}}
                        onSrvValidationChanged={tknValidChanged}
                        onSrvValidationError={tknValidationError}
                        onChange={tknChanged}
                        maxLength={24}
                    />
                    {tknCheckFailed
                        ? <p className="text-danger font-semibold">{t('tkn-check-failed')}</p>
                        : <> {showTknInvalid
                            ? <p className="text-danger font-semibold">{t('tkn-invalid')}</p>
                            : <>{tknValid
                                ? <p className="text-success font-semibold">{t('tkn-valid')}</p>
                                : <p className="text-danger invisible font-semibold">L</p>
                            }</>
                        } </>
                    }
                </div>
                {tknValid && <form onSubmit={handleSubmit(changePassword)} noValidate>
                    <div className="flex flex-col mt-4">
                        <h2 className="text-2xl mb-4">{t('forgotten-password-new-password-title')}</h2>
                        <div className="flex gap-8">
                            <div className="mb-3 flex-1">
                                <div className="flex justify-between">
                                    <Label htmlFor="username">{t('password-label')}</Label>
                                    <Help
                                        tooltipId="password-help"
                                        className="w-4"
                                        content={t('password-help')}
                                    />
                                </div>
                                <Input
                                    type="password"
                                    id="password"
                                    required
                                    {...register('password')}
                                    />
                                {errors.password
                                    ? <p className="text-danger font-semibold">{errors.password.message}</p>
                                    : <p className="text-danger invisible font-semibold">L</p>}
                            </div>
                            <div className="mb-3 flex-1">
                                <div className="flex justify-between">
                                    <Label htmlFor="username">{t('cpassword-label')}</Label>
                                    <Help
                                        tooltipId="cpassword-help"
                                        className="w-4"
                                        content={t('cpassword-help')}
                                    />
                                </div>
                                <Input
                                    type="password"
                                    id="password-confirm"
                                    required
                                    {...register('cpassword')}
                                    />
                                {errors.cpassword
                                    ? <p className="text-danger font-semibold">{errors.cpassword.message}</p>
                                    : <p className="text-danger invisible font-semibold">L</p>}
                            </div>
                        </div>
                        <BtnPrimary type="submit" className="mt-4">{t('forgotten-password-change-password-btn')}</BtnPrimary>
                    </div>
                </form>
                }
            </Card>
        </div>
    )
}

interface Props {
    email: string
    waitBeforeResend: number
}

