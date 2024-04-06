import {ChangeEvent, ReactElement, useState} from "react";
import Card from "@components/widgets/Card.tsx";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {EmailInput, Input, UsernameInput} from "@components/widgets/Input.tsx";
import {BtnPrimary, BtnTextPrimary} from "@components/widgets/Buttons.tsx";
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {useLocation} from "wouter";
import useFormValidate from "@hooks/useFormValidate.ts";
import {Language} from "@models/config.tsx";
import {useLanguage} from "@hooks/useLanguage.ts";

export default function RegisterCaptcha(): ReactElement {
    const [location, navigate] = useLocation()
    const lang: Language = useLanguage()
    const {passwordValidate, usernameValidate, emailValidate, displaynameValidate}
        = useFormValidate()

    const [formData, setFormData]
        = useState<FormData>({email: '', displayname: '', password: '', hcaptcha: '', username: ''})

    const [formConfirmData, setFormConfirmData]
        = useState<FormConfirmData>({email: '', password: ''})

    const [formErrors, setFormErrors]
        = useState<FormErrors>({
        email: FieldError.None,
        displayname: FieldError.None,
        hcaptcha: FieldError.None,
        password: FieldError.None,
        username: FieldError.None
    })

    const [formShowError, setFormShowError]
        = useState<FormShowError>({
        email: false,
        displayname: false,
        hcaptcha: false,
        password: false,
        username: false
        })

    function navigateBack() {
        navigate("/login-form/main")
    }

    function usernameChanged(e: ChangeEvent<HTMLInputElement>) {
        setFormData((p: FormData) => {
            return {
                email: p.email,
                password: p.password,
                displayname: p.displayname,
                hcaptcha: p.hcaptcha,
                username: e.target.value
            }
        })
        setFormShowError((p: FormShowError) => {
            return {
                email: p.email,
                password: p.password,
                displayname: p.displayname,
                hcaptcha: p.hcaptcha,
                username: false
            }
        })
    }

    function emailChanged(e: ChangeEvent<HTMLInputElement>) {
        setFormData((p: FormData) => {
            return {
                email: e.target.value.trim(),
                password: p.password,
                displayname: p.displayname,
                hcaptcha: p.hcaptcha,
                username: p.username
            }
        })
        setFormShowError((p: FormShowError) => {
            return {
                email: false,
                password: p.password,
                displayname: p.displayname,
                hcaptcha: p.hcaptcha,
                username: p.username
            }
        })
    }

    function passwordChanged(e: ChangeEvent<HTMLInputElement>) {
        setFormData((p: FormData) => {
            return {
                email: p.email,
                password: e.target.value,
                displayname: p.displayname,
                hcaptcha: p.hcaptcha,
                username: p.username
            }
        })
        setFormShowError((p: FormShowError) => {
            return {
                email: p.email,
                password: false,
                displayname: p.displayname,
                hcaptcha: p.hcaptcha,
                username: p.username
            }
        })
    }

    function displaynameChanged(e: ChangeEvent<HTMLInputElement>) {
        setFormData((p: FormData) => {
            return {
                email: p.email,
                password: p.password,
                displayname: e.target.value.trim(),
                hcaptcha: p.hcaptcha,
                username: p.username
            }
        })
        setFormShowError((p: FormShowError) => {
            return {
                email: p.email,
                password: p.password,
                displayname: false,
                hcaptcha: p.hcaptcha,
                username: p.username
            }
        })
    }

    function emailConfirmChanged(e: ChangeEvent<HTMLInputElement>) {
        setFormConfirmData((p: FormConfirmData) => {
            return {
                email: e.target.value.trim(),
                password: p.password,
            }
        })
        setFormShowError((p: FormShowError) => {
            return {
                email: false,
                password: p.password,
                displayname: p.displayname,
                hcaptcha: p.hcaptcha,
                username: p.username
            }
        })
    }

    function passwordConfirmChanged(e: ChangeEvent<HTMLInputElement>) {
        setFormConfirmData((p: FormConfirmData) => {
            return {
                email: p.email,
                password: e.target.value,
            }
        })
        setFormShowError((p: FormShowError) => {
            return {
                email: p.email,
                password: false,
                displayname: p.displayname,
                hcaptcha: p.hcaptcha,
                username: p.username
            }
        })
    }

    function checkFields(): FormErrors {
        let ret: FormErrors = {
            email: FieldError.None,
            username: FieldError.None,
            password: FieldError.None,
            displayname: FieldError.None,
            hcaptcha: FieldError.None
        }

        if(formData.email !== formConfirmData.email)
            ret.email = FieldError.NoMatch
        else if (formData.email === "")
            ret.email = FieldError.Missing
        else if (!emailValidate(formData.email))
            ret.email = FieldError.InvalidFormat

        if(formData.username === "")
            ret.username = FieldError.Missing
        else if(!usernameValidate(formData.username))
            ret.username = FieldError.InvalidFormat

        if(formData.password !== formConfirmData.password)
            ret.password = FieldError.NoMatch
        else if(formData.password === "")
            ret.password = FieldError.Missing
        else if (!passwordValidate(formData.password))
            ret.password = FieldError.InvalidFormat

        if(formData.displayname === "")
            ret.displayname = FieldError.Missing
        else if(!displaynameValidate(formData.displayname))
            ret.displayname = FieldError.InvalidFormat

        if(formData.hcaptcha === "")
            ret.hcaptcha = FieldError.Missing

        return ret
    }

    function createAccountClicked() {
        const fieldsError = checkFields()
        setFormErrors(fieldsError)
        setFormShowError({email: true, username: true, password: true, displayname: true, hcaptcha: true})

        if(
            fieldsError.username !== FieldError.None
            || fieldsError.displayname !== FieldError.None
            || fieldsError.email !== FieldError.None
            || fieldsError.password !== FieldError.None
            || fieldsError.hcaptcha !== FieldError.None
        )
            return


        console.log('form ready')
    }

    function hcaptchaVerified(tkn: string) {
        setFormData((p: FormData) => {
            return {
                email: p.email,
                password: p.password,
                displayname: p.displayname,
                username: p.username ,
                hcaptcha: tkn
            }
        })
        setFormShowError((p: FormShowError) => {
            return {
                email: p.email,
                password: p.password,
                displayname: p.displayname,
                hcaptcha: false,
                username: p.username
            }
        })
    }

    function hcaptchaExpired() {
        setFormData((p: FormData) => {
            return {
                email: p.email,
                password: p.password,
                displayname: p.displayname,
                username: p.username ,
                hcaptcha: ""
            }
        })
    }

    return (
        <div className="flex justify-center items-center h-dvh">
            <Card className="m-8 min-w-[22rem] w-[40rem]">
                <div className="flex items-start mb-6">
                    <h1 className="text-4xl">Registrace</h1>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex gap-8 w-full">
                        <div className="flex flex-col w-full">
                            <div className="mb-3">
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
                                    onChange={usernameChanged}
                                    tabIndex={1}
                                />
                                {formShowError.username
                                ? <>
                                        {formErrors.username === FieldError.Missing && <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>}
                                        {formErrors.username === FieldError.InvalidResponse && <p className="text-danger font-semibold">Účet s tímto uživatelských jménem již existuje</p>}
                                        {formErrors.username === FieldError.InvalidFormat && <p className="text-danger font-semibold">Toto není platné uživatelské jméno</p>}
                                        {formErrors.username === FieldError.None && <p className="invisible">L</p>}
                                    </>
                                : <p className="invisible">L</p>
                                }
                            </div>

                            <div className="mb-3">
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
                                    onChange={emailChanged}
                                    tabIndex={3}
                                />
                                {formShowError.email
                                    ? <>
                                        {formErrors.email === FieldError.Missing && <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>}
                                        {formErrors.email === FieldError.NoMatch && <p className="text-danger font-semibold">Emaily jsou odlišné</p>}
                                        {formErrors.email === FieldError.InvalidResponse && <p className="text-danger font-semibold">Účet s tímto emailem již existuje</p>}
                                        {formErrors.email === FieldError.InvalidFormat && <p className="text-danger font-semibold">Toto není platný email</p>}
                                        {formErrors.email === FieldError.None && <p className="invisible">L</p>}
                                    </>
                                    : <p className="invisible">L</p>
                                }
                            </div>

                            <div className="mb-3">
                                <div className="flex justify-between">
                                    <Label htmlFor="email">Heslo</Label>
                                    <Help
                                        tooltipId="password-help"
                                        className="w-4"
                                        content="Heslo musí obsahovat alespoň 8 znaků, z čehož musí být alespoň<br>jedna číslice, jedno velké písmeno a jeden speciální znak"
                                    />
                                </div>
                                <Input
                                    type="password"
                                    id="password"
                                    required
                                    onChange={passwordChanged}
                                    tabIndex={5}
                                />
                                {formShowError.password
                                    ? <>
                                        {formErrors.password === FieldError.Missing && <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>}
                                        {formErrors.password === FieldError.NoMatch && <p className="text-danger font-semibold">Hesla jsou odlišná</p>}
                                        {formErrors.password === FieldError.InvalidResponse && <p className="text-danger font-semibold">Toto není dostatečně silné heslo</p>}
                                        {formErrors.password === FieldError.InvalidFormat && <p className="text-danger font-semibold">Toto není dostatečně silné heslo</p>}
                                        {formErrors.password === FieldError.None && <p className="invisible">L</p>}
                                    </>
                                    : <p className="invisible">L</p>
                                }
                            </div>
                        </div>
                        <div className="flex flex-col w-full">
                            <div className="mb-3">
                                <div className="flex justify-between">
                                    <Label htmlFor="displayname">Zobrazené jméno</Label>
                                    <Help
                                        tooltipId="displayname-help"
                                        className="w-4"
                                        content="Zobrazené jméno je jméno, pod kterým se bude zobrazovat váš účet, jeho hodnotu<br>je možné později změnit. Musí mít 4-24 znaků a není limitováno malými písmeny."
                                    />
                                </div>
                                <Input
                                    type="text"
                                    id="displayname"
                                    required
                                    onChange={displaynameChanged}
                                    tabIndex={2}
                                />
                                {formShowError.displayname
                                    ? <>
                                        {formErrors.displayname === FieldError.Missing && <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>}
                                        {formErrors.displayname === FieldError.InvalidResponse && <p className="text-danger font-semibold">Toto není platné zobrazené jméno</p>}
                                        {formErrors.displayname === FieldError.InvalidFormat && <p className="text-danger font-semibold">Toto není platné zobrazené jméno</p>}
                                        {formErrors.displayname === FieldError.None && <p className="invisible">L</p>}
                                    </>
                                    : <p className="invisible">L</p>
                                }
                            </div>
                            <div className="mb-3">
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
                                    onChange={emailConfirmChanged}
                                    tabIndex={4}
                                />
                                {formShowError.email
                                    ? <>
                                        {formErrors.email === FieldError.Missing && <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>}
                                        {formErrors.email === FieldError.NoMatch && <p className="text-danger font-semibold">Emaily jsou odlišné</p>}
                                        {formErrors.email === FieldError.InvalidResponse && <p className="text-danger font-semibold">Účet s tímto emailem již existuje</p>}
                                        {formErrors.email === FieldError.InvalidFormat && <p className="text-danger font-semibold">Toto není platný email</p>}
                                        {formErrors.email === FieldError.None && <p className="invisible">L</p>}
                                    </>
                                    : <p className="invisible">L</p>
                                }
                            </div>

                            <div className="mb-3">
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
                                    onChange={passwordConfirmChanged}
                                    required
                                    tabIndex={6}
                                />
                                {formShowError.password
                                    ? <>
                                        {formErrors.password === FieldError.Missing && <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>}
                                        {formErrors.password === FieldError.NoMatch && <p className="text-danger font-semibold">Hesla jsou odlišná</p>}
                                        {formErrors.password === FieldError.InvalidResponse && <p className="text-danger font-semibold">Toto není dostatečně silné heslo</p>}
                                        {formErrors.password === FieldError.InvalidFormat && <p className="text-danger font-semibold">Toto není dostatečně silné heslo</p>}
                                        {formErrors.password === FieldError.None && <p className="invisible">L</p>}
                                    </>
                                    : <p className="invisible">L</p>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 mb-3">
                        <HCaptcha
                            sitekey="f407df07-d0ab-4d1c-bd1e-f0e8adc19dbc"
                            onVerify={hcaptchaVerified}
                            onExpire={hcaptchaExpired}
                            onChalExpired={hcaptchaExpired}
                            languageOverride={lang}
                        />
                        {formShowError.hcaptcha
                            ? <>
                                {formErrors.hcaptcha === FieldError.Missing && <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>}
                                {formErrors.hcaptcha === FieldError.None && <p className="invisible">L</p> }
                            </>
                            : <p className="invisible">L</p>
                        }
                    </div>
                    <div className="w-full">
                        <BtnPrimary className="w-full mb-2" onClick={createAccountClicked}>Založit účet</BtnPrimary>
                        <span>Máte již účet? <BtnTextPrimary onClick={navigateBack}>Přihlásit se</BtnTextPrimary></span>
                    </div>
                </div>
            </Card>
        </div>
    )
}

interface FormData {
    username: string,
    displayname: string,
    email: string,
    password: string,
    hcaptcha: string
}

interface FormConfirmData {
    email: string,
    password: string,
}


enum FieldError {
    None,
    Missing,
    NoMatch,
    InvalidFormat,
    InvalidResponse
}

interface FormErrors {
    username: FieldError,
    displayname: FieldError,
    email: FieldError,
    password: FieldError,
    hcaptcha: FieldError,
}

interface FormShowError {
    username: boolean,
    displayname: boolean
    email: boolean,
    password: boolean
    hcaptcha: boolean
}