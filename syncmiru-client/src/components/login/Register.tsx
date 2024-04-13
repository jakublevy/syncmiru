import {ReactElement, useState} from "react";
import Card from "@components/widgets/Card.tsx";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {EmailInput, EmailInputSrvValidate, Input, UsernameInputSrvValidate} from "@components/widgets/Input.tsx";
import {DisplaynameInput} from "@components/widgets/Input.tsx";
import {BtnPrimary, BtnTextPrimary} from "@components/widgets/Buttons.tsx";
import {useLocation} from "wouter";
import {Language} from "@models/config.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";
import HCaptchaThemeAware from "@components/widgets/HCaptchaThemeAware.tsx";
import {useForm} from "react-hook-form";
import Joi from 'joi'
import {joiResolver} from "@hookform/resolvers/joi";
import Loading from "@components/Loading.tsx";
import {invoke} from "@tauri-apps/api/core";
import {RegFormFields, useRegFormSchema} from "@hooks/useRegFormSchema.ts";
import {VerifyEmailHistoryState} from "@models/historyState.ts";
import {showErrorAlert} from "src/utils/alert.ts";

export default function Register({regPubAllowed}: Props): ReactElement {
    const [_, navigate] = useLocation()
    const lang: Language = useLanguage()

    const [loading, setLoading] = useState<boolean>(false);

    const [unique, setUnique]
        = useState<Unique>({email: true, username: true})

    const formSchema: Joi.ObjectSchema<RegFormFields> = useRegFormSchema(regPubAllowed)

    const {
        register,
        handleSubmit,
        setValue ,
        trigger,
        formState: {errors}
    } = useForm<RegFormFields>({resolver: joiResolver(formSchema)});

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
        else
            send.reg_tkn = data.regTkn

        setLoading(true)
        invoke<void>('send_registration', {data: JSON.stringify(send)})
            .then(() => {
                setLoading(false)
                navigate('/email-verify', {state: {email: data.email} as VerifyEmailHistoryState})
            })
            .catch((e) => {
                setValue('captcha', '')
                setLoading(false)
                showErrorAlert(e)
            })
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

    if(loading)
        return <Loading/>

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[25rem] w-[40rem] m-3">
                <div className="flex items-start mb-6">
                    <h1 className="text-4xl">Registrace</h1>
                </div>
                <form onSubmit={handleSubmit(createAccount)} noValidate>
                    {!regPubAllowed
                        && <div className="flex flex-col">
                            <div className="mb-3 flex-1">
                                <p>Volné registrace jsou momentálně uzavřeny. Registrovat se můžete pouze se znalostí
                                    tokenu, který vám musí vygenerovat oprávněná osoba.</p>
                            </div>
                            <div className="mb-3 flex-1">
                                <div className="flex justify-between">
                                    <Label htmlFor="username">Registrační token</Label>
                                    <Help
                                        tooltipId="regTkn-help"
                                        className="w-4"
                                        content="TODO"
                                    />
                                </div>
                                <Input
                                    id="regTkn"
                                    required
                                    {...register('regTkn')}
                                />
                                {errors.regTkn
                                    ? <p className="text-danger font-semibold">{errors.regTkn.message}</p>
                                    : <p className="text-danger invisible font-semibold">L</p>
                                }
                            </div>
                        </div>
                    }
                    <div className="flex gap-8">
                        <div className="mb-3 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="username">Uživatelské jméno</Label>
                                <Help
                                    tooltipId="username-help"
                                    className="w-4"
                                    content="Uživatelské jméno je vaším identifikátorem na serveru,<br>je neměnné a musí obsahovat 4-16 znaků malých písmen a-z"
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
                                        ? <p className="text-danger font-semibold">Již obsazeno</p>
                                        : <p className="text-danger invisible font-semibold">L</p>}
                                </>
                            }
                        </div>
                        <div className="mb-3 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="displayname">Zobrazené jméno</Label>
                                <Help
                                    tooltipId="displayname-help"
                                    className="w-4"
                                    content="Zobrazené jméno je jméno, pod kterým se bude zobrazovat váš účet, jeho hodnotu<br>je možné později změnit. Musí mít 4-24 znaků a není limitováno malými písmeny."
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
                                <Label htmlFor="email">Email</Label>
                                <Help
                                    tooltipId="email-help"
                                    className="w-4"
                                    content="Váš email, vyplňte ho pravdivě. Budete ho potřebovat<br>pro ověření účtu a může se hodit pro obnovu hesla"
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
                                        ? <p className="text-danger font-semibold">Již registrován</p>
                                        : <p className="text-danger invisible font-semibold">L</p>}
                                </>}
                        </div>
                        <div className="mb-3 flex-1">
                            <div className="flex justify-between">
                                <Label htmlFor="email-confirm">Potvrzení emailu</Label>
                                <Help
                                    tooltipId="email-confirm"
                                    className="w-4"
                                    content="Váš email ještě jednou pro kontrolu"
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
                                <Label htmlFor="email">Heslo</Label>
                                <Help
                                    tooltipId="password-help"
                                    className="w-4"
                                    content="Heslo musí obsahovat alespoň 8 znaků"
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
                                <Label htmlFor="password-confirm">Potvrzení hesla</Label>
                                <Help
                                    tooltipId="password-confirm-help"
                                    className="w-4"
                                    content="Vaše heslo ještě jednou pro kontrolu"
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
                        >Založit účet</BtnPrimary>
                        <span>Máte již účet? <BtnTextPrimary onClick={navigateBack}>Přihlásit se</BtnTextPrimary></span>
                    </div>
                </form>
            </Card>
        </div>
    )
}

interface Props {
    regPubAllowed: boolean
}

interface RegData {
    username: string,
    displayname: string,
    email: string,
    password: string,
    captcha: string,
    reg_tkn: String
}

interface Unique {
    email: boolean,
    username: boolean
}
