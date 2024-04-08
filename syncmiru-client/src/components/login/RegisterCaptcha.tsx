import {ReactElement} from "react";
import Card from "@components/widgets/Card.tsx";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {DisplaynameInput, EmailInput, Input, UsernameInput} from "@components/widgets/Input.tsx";
import {BtnPrimary, BtnTextPrimary} from "@components/widgets/Buttons.tsx";
import {useLocation} from "wouter";
import useFormValidate from "@hooks/useFormValidate.ts";
import {Language} from "@models/config.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";
import HCaptchaThemeAware from "@components/widgets/HCaptchaThemeAware.tsx";
import {useForm} from "react-hook-form";
import Joi from 'joi'
import {joiResolver} from "@hookform/resolvers/joi";

export default function RegisterCaptcha(): ReactElement {
    const [_, navigate] = useLocation()
    const lang: Language = useLanguage()
    const {passwordValidate, usernameValidate, displaynameValidate}
        = useFormValidate()

    const formSchema: Joi.ObjectSchema<FormFields> = Joi.object({
        email: Joi
            .string()
            .email({tlds: false})
            .required()
            .messages({"string.empty": 'Toto pole musí být vyplněno', "string.email": "Toto není platný email"}),
        password: Joi
            .string()
            .required()
            .messages({"string.empty": 'Toto pole musí být vyplněno'})
            .custom((v: string, h) => {
                if(!passwordValidate(v))
                    return h.message({custom: "Toto není dostatečně silné heslo"})
                return v
            }),
        username: Joi
            .string()
            .required()
            .messages({"string.empty": 'Toto pole musí být vyplněno'})
            .custom((v: string, h) => {
                if (!usernameValidate(v))
                    return h.message({custom: "Toto není platné uživatelské jméno"})
                return v
            }),
        displayname: Joi
            .string()
            .required()
            .messages({"string.empty": 'Toto pole musí být vyplněno'})
            .custom((v: string, h) => {
                if (!displaynameValidate(v))
                    return h.message({custom: "Toto není platné zobrazené jméno"})
            }),
        cpassword: Joi
            .string()
            .valid(Joi.ref('password'))
            .required()
            .empty('')
            .messages({"any.only": "Hesla nejsou stejná", "any.required": "Toto pole musí být vyplněno"}),

        cemail: Joi
            .string()
            .valid(Joi.ref("email"))
            .required()
            .empty('')
            .messages({"any.only": "Emaily nejsou stejné", "any.required": "Toto pole musí být vyplněno"}),

        captcha: Joi
            .string()
            .required()
            .messages({"string.empty": 'Captcha musí být vyplněna'})
    })

    const {
        register,
        handleSubmit,
        setValue ,
        trigger,
        formState: {errors}
    } = useForm<FormFields>({resolver: joiResolver(formSchema)});

    function navigateBack() {
        navigate("/login-form/main")
    }

    function createAccount(data: FormFields) {
        console.log(JSON.stringify(data))
    }

    function captchaVerified(tkn: string) {
        setValue('captcha', tkn)
        trigger('captcha')
    }

    function captchaExpired() {
        setValue('captcha', '')
    }

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="min-w-[25rem] w-[40rem] m-3">
                <div className="flex items-start mb-6">
                    <h1 className="text-4xl">Registrace</h1>
                </div>
                <form onSubmit={handleSubmit(createAccount)} noValidate>
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
                            <UsernameInput
                                type="text"
                                id="username"
                                required
                                {...register('username')}
                            />
                            {errors.username
                                ? <p className="text-danger font-semibold">{errors.username.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>}
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
                                type="text"
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
                            <EmailInput
                                id="email"
                                required
                                {...register('email')}
                            />

                            {errors.email
                                ? <p className="text-danger font-semibold">{errors.email.message}</p>
                                : <p className="text-danger invisible font-semibold">L</p>}
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
                    <div className="flex items-center mb-3 flex-col">
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

type FormFields = {
    username: string,
    displayname: string,
    email: string,
    cemail: string
    password: string
    cpassword: string
    captcha: string
}
