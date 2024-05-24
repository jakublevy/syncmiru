import {ReactElement, useState} from "react";
import Card from "@components/widgets/Card.tsx";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {
    EmailInput,
    EmailInputSrvValidate,
    Input,
    RegTknSrvValidate,
    UsernameInputSrvValidate
} from "@components/widgets/Input.tsx";
import {DisplaynameInput} from "@components/widgets/Input.tsx";
import {BtnPrimary, BtnTextPrimary} from "@components/widgets/Button.tsx";
import {useLocation} from "wouter";
import {Language} from "@models/config.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";
import HCaptchaThemeAware from "@components/widgets/HCaptchaThemeAware.tsx";
import {useForm, useWatch} from "react-hook-form";
import Joi from 'joi'
import {joiResolver} from "@hookform/resolvers/joi";
import Loading from "@components/Loading.tsx";
import {RegFormFields, useRegFormSchema} from "@hooks/useRegFormSchema.ts";
import {useTranslation} from "react-i18next";
import {navigateToEmailVerify} from "src/utils/navigate.ts";
import {RegData} from "@models/login.ts";
import {useSendRegistration} from "@hooks/useSendRegistration.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function Register({regPubAllowed}: Props): ReactElement {
    const [_, navigate] = useLocation()
    const lang: Language = useLanguage()
    const {t} = useTranslation()
    const sendRegistration = useSendRegistration()

    const [loading, setLoading] = useState<boolean>(false);

    const [unique, setUnique]
        = useState<Unique>({email: true, username: true})
    const [regTknValid, setRegTknValid] = useState<boolean>(false)

    const formSchema: Joi.ObjectSchema<RegFormFields> = useRegFormSchema(regPubAllowed, t)

    const {
        register,
        handleSubmit,
        setValue ,
        watch,
        trigger,
        formState: {errors}
    } = useForm<RegFormFields>({resolver: joiResolver(formSchema)});

    const regTkn = watch('regTkn')

    function navigateBack() {
        navigate("/login-form/main")
    }

    function createAccount(data: RegFormFields) {
        if(!unique.email || !unique.username)
            return

        const send: RegData = {
            email: data.email,
            username: data.username,
            displayname: data.displayname,
            password: data.password,
            captcha: '',
            reg_tkn: ''
        }
        if(regPubAllowed)
            send.captcha = data.captcha
        else {
            if(!regTknValid)
                return
            send.reg_tkn = data.regTkn
        }

        setLoading(true)
        sendRegistration(send)
            .then(() => {
                navigateToEmailVerify(navigate, {email: data.email})
            })
            .catch((e) => {
                setValue('captcha', '')
                showPersistentErrorAlert(t('register-failed'))
            })
            .finally(() => setLoading(false))
    }

    function captchaVerified(tkn: string) {
        setValue('captcha', tkn)
        trigger('captcha')
    }

    function captchaExpired() {
        setValue('captcha', '')
    }

    function usernameUniqueChanged(unique: boolean) {
        setUnique((p) => { return {
            email: p.email,
            username: unique
        }})
    }

    function emailUniqueChanged(unique: boolean) {
        setUnique((p) => {return {
            email: unique,
            username: p.username
        }})
    }

    function regTknValidationChanged(valid: boolean) {
        setRegTknValid(valid)
    }

    if(loading)
        return <Loading/>

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[25rem] w-[40rem] m-3 p-6">
                <div className="flex items-start mb-6">
                    <h1 className="text-4xl">{t('register-title')}</h1>
                </div>
                <form onSubmit={handleSubmit(createAccount)} noValidate>
                    {!regPubAllowed
                        && <div className="flex flex-col">
                            <div className="mb-3 flex-1">
                                <p>{t('register-tkn-required-msg')}</p>
                            </div>
                            <div className="mb-3 flex-1">
                                <div className="flex justify-between">
                                    <Label htmlFor="username">{t('register-tkn-label')}</Label>
                                    <Help
                                        tooltipId="regTkn-help"
                                        className="w-4"
                                        content="TODO"
                                    />
                                </div>
                                <RegTknSrvValidate
                                    id="regTkn"
                                    required
                                    maxLength={24}
                                    onSrvValidationChanged={regTknValidationChanged}
                                    {...register('regTkn')}
                                />
                                {errors.regTkn
                                    ? <p className="text-danger font-semibold">{errors.regTkn.message}</p>
                                    : <>
                                        {!regTknValid && (regTkn !== undefined && regTkn !== '') && <p className="text-danger font-semibold">Neplatný nebo již použitý token</p> }
                                        {regTknValid && <p className="text-success font-semibold">Token je validní</p>}
                                        {(regTkn === undefined || regTkn === '') && <p className="text-danger invisible font-semibold">L</p>}
                                    </>
                                }
                            </div>
                        </div>
                    }
                    <div className="flex gap-8">
                        <div className="mb-3 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="username">{t('username-label')}</Label>
                                <Help
                                    tooltipId="username-help"
                                    className="w-4"
                                    content={t('username-help')}
                                />
                            </div>
                            <UsernameInputSrvValidate
                                id="username"
                                onSrvValidationChanged={usernameUniqueChanged}
                                required
                                {...register('username')}
                            />
                            {errors.username
                                ? <p className="text-danger font-semibold">{errors.username.message}</p>
                                : <>
                                    {!unique.username
                                        ? <p className="text-danger font-semibold">{t('field-not-unique-error')}</p>
                                        : <p className="text-danger invisible font-semibold">L</p>}
                                </>
                            }
                        </div>
                        <div className="mb-3 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="displayname">{t('displayname-label')}</Label>
                                <Help
                                    tooltipId="displayname-help"
                                    className="w-4"
                                    content={t('displayname-help')}
                                />
                            </div>
                            <DisplaynameInput
                                id="displayname"
                                required
                                {...register('displayname')}
                            />
                            {errors.displayname
                                ? <p className="text-danger font-semibold">{errors.displayname.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>}
                        </div>
                    </div>

                    <div className="flex gap-8">
                        <div className="mb-3 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="email">{t('email-label')}</Label>
                                <Help
                                    tooltipId="email-help"
                                    className="w-4"
                                    content={t('register-email-help')}
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
                                    {!unique.email
                                        ? <p className="text-danger font-semibold">{t('field-already-registered-error')}</p>
                                        : <p className="text-danger invisible font-semibold">L</p>}
                                </>}
                        </div>
                        <div className="mb-3 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="email-confirm">{t('cemail-label')}</Label>
                                <Help
                                    tooltipId="email-confirm"
                                    className="w-4"
                                    content={t('cemail-help')}
                                />
                            </div>
                            <EmailInput
                                id="email-confirm"
                                autoComplete="off"
                                required
                                {...register('cemail')}
                            />
                            {errors.cemail
                                ? <p className="text-danger font-semibold">{errors.cemail.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>}
                        </div>
                    </div>

                    <div className="flex gap-8">
                        <div className="mb-3 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="email">{t('password-label')}</Label>
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
                        <div className="mb-6 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="password-confirm">{t('cpassword-label')}</Label>
                                <Help
                                    tooltipId="password-confirm-help"
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
                    {regPubAllowed
                        && <div className="flex items-center mb-3 flex-col">
                            <HCaptchaThemeAware
                                sitekey="f407df07-d0ab-4d1c-bd1e-f0e8adc19dbc"
                                languageOverride={lang}
                                onVerify={captchaVerified}
                                onChalExpired={captchaExpired}
                                onExpire={captchaExpired}
                            />
                            {errors.captcha
                                ? <p className="text-danger font-semibold">{errors.captcha.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>}

                            <input
                                type="hidden"
                                {...register('captcha')}
                            />
                        </div>
                    }
                    <div className="w-full">
                        <BtnPrimary
                            className="w-full mb-2"
                            type="submit"
                        >{t('register-create-account-msg')}</BtnPrimary>
                        <span>{t('already-have-account-msg')} <BtnTextPrimary onClick={navigateBack}>{t('login-btn')}</BtnTextPrimary></span>
                    </div>
                </form>
            </Card>
        </div>
    )
}

interface Props {
    regPubAllowed: boolean
}

interface Unique {
    email: boolean,
    username: boolean
}
