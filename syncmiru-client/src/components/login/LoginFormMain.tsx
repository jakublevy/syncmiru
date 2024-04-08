import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import LanguageSelector from "@components/widgets/LanguageSelector.tsx";
import {BtnPrimary, BtnTextPrimary} from "@components/widgets/Buttons.tsx";
import {Input} from "@components/widgets/Input.tsx";
import {EmailInput} from "@components/widgets/EmailInput.tsx";
import {useHomeServer} from "@hooks/useHomeServer.ts";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import Card from "@components/widgets/Card.tsx";
import {useServiceStatusSWR} from "@hooks/useServiceStatus.ts";
import {useHistoryState} from "wouter/use-browser-location";
import {LoginFormHistoryState} from "@models/historyState.ts";
import useFormValidate from "@hooks/useFormValidate.ts";


export default function LoginFormMain(): ReactElement {
    const [location, navigate] = useLocation()
    const historyState: LoginFormHistoryState | undefined = useHistoryState()
    const {t} = useTranslation()

    const [homeSrvResponseError, setHomeSrvResponseError] = useState<boolean>(false);
    const homeSrv = useHomeServer()
    const {
        isLoading: homeSrvServiceIsLoading,
        error: homeSrvServiceError
    } = useServiceStatusSWR()

    const {emailValidate} = useFormValidate()

    const [formData, setFormData]
        = useState<FormData>({email: '', password: ''})

    const [formErrors, setFormErrors]
        = useState<FormErrors>({email: FieldError.None, password: FieldError.None})

    const [formShowError, setFormShowError]
        = useState<FormShowError>({email: false, srv: false, password: false})

    useEffect(() => {
        if (historyState != null) {
            if (historyState.email !== undefined)
                setFormData((p: FormData) => {
                    return {email: historyState.email as string, password: p.password}
                })

            if (historyState.fieldsError !== undefined) {
                setFormErrors({email: FieldError.InvalidResponse, password: FieldError.InvalidResponse})
                setFormShowError((p: FormShowError) => {
                    return {email: true, password: true, srv: p.srv}
                })
            }
            if (historyState.homeSrvError !== undefined)
                setHomeSrvResponseError(true)
        }
    }, [historyState]);

    function editClicked() {
        navigate('/login-form/home-server')
        setHomeSrvResponseError(false)
    }

    function checkFields(): FormErrors {
        let ret: FormErrors = {email: FieldError.None, password: FieldError.None}

        if (formData.email === "")
            ret.email = FieldError.Missing
        else if (!emailValidate(formData.email))
            ret.email = FieldError.InvalidFormat

        if (formData.password === "")
            ret.password = FieldError.Missing

        return ret
    }

    function homeServerError(): boolean {
        return homeSrvServiceError || homeSrvResponseError
    }

    function checkHomeServer() {
        return !homeServerError() && homeSrv !== ""
    }

    function regBtnClicked() {
        const fieldsError = checkFields()
        setFormErrors(fieldsError)

        setFormShowError({srv: true, email: false, password: false})
        if (!checkHomeServer())
            return

        navigate('/register')
    }

    function loginBtnClicked() {
        const fieldsError = checkFields()
        setFormErrors(fieldsError)
        setFormShowError({srv: true, email: true, password: true})

        if (
            checkHomeServer()
            && [FieldError.None, FieldError.InvalidResponse].includes(fieldsError.password)
            && [FieldError.None, FieldError.InvalidResponse].includes(fieldsError.email)
        ) {
            // TODO: continue login
            console.log('continue login')
        }
    }

    function forgottenPasswordBtnClicked() {
        const fieldsError = checkFields()
        setFormErrors(fieldsError)
        setFormShowError({srv: true, email: true, password: false})

        if (
            checkHomeServer()
            && [FieldError.None, FieldError.InvalidResponse].includes(fieldsError.email)
        ) {
            // TODO: continue forgotten password
            console.log('continue forgotten password')
        }
    }

    function emailChanged(e: ChangeEvent<HTMLInputElement>) {
        setFormData((p: FormData): FormData => {
            return {email: e.target.value.trim(), password: p.password}
        })
        setFormShowError((p: FormShowError) => {
            return {email: false, password: p.password, srv: p.srv}
        })
    }

    function passwordChanged(e: ChangeEvent<HTMLInputElement>) {
        setFormData((p: FormData): FormData => {
            return {password: e.target.value, email: p.email}
        })
        setFormShowError((p: FormShowError) => {
            return {password: false, email: p.email, srv: p.srv}
        })
    }

    if (location === '/login-form/main')
        return (
            <div className="flex justify-centersafe items-center w-dvw">
                <Card className="min-w-[25rem] w-[30rem] m-3">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl">{t('login-title')}</h1>
                        <LanguageSelector className="w-40 ml-4"/>
                    </div>
                    <div className="mb-5 relative">
                        <div className="flex justify-between">
                            <Label htmlFor="srv">{t('home-srv')}</Label>
                            <Help
                                tooltipId="srv-help"
                                className="w-4"
                                content={t('home-srv-login-help')}
                            />
                        </div>
                        <div
                            className="w-full p-2.5 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-darkbg dark:placeholder-gray-400 dark:text-darkread">
                            <input type="text" id="srv"
                                   className="w-[85%] text-gray-900 dark:text-darkread bg-white dark:bg-darkbg text-sm focus:ring-primary focus:border-primary block"
                                   readOnly
                                   disabled
                                   value={homeSrv}
                            />
                        </div>
                        <BtnTextPrimary
                            onClick={editClicked}
                            className="text-sm absolute -mt-8 right-1.5">{t('home-srv-edit-btn')}</BtnTextPrimary>

                        {homeSrv === "" ?
                            <>
                                {formShowError.srv
                                    ? <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>
                                    : <p className="invisible">L</p>
                                }
                            </>
                            : <>
                                {homeSrvServiceIsLoading && !homeServerError() &&
                                    <p className="invisible">L</p>}
                                {homeServerError() &&
                                    <p className="text-danger font-semibold">Instance serveru nebyla nalezena,
                                        zkontrolujte adresu</p>}
                                {!homeServerError() && !homeSrvServiceIsLoading &&
                                    <p className="text-emerald-500 font-semibold">Server nalezen</p>}
                            </>
                        }
                    </div>
                    <div className="mb-5">
                        <div className="flex justify-between">
                            <Label htmlFor="email">{t('email-label')}</Label>
                            <Help
                                tooltipId="email-help"
                                className="w-4"
                                content="Váš email, který jste použili pro registraci.<br>Toto pole vyplňte i v případě, kdy si chcete obnovit heslo."
                            />
                        </div>
                        <EmailInput
                            id="email"
                            value={formData.email}
                            onChange={emailChanged}
                        />
                        {formShowError.email
                            ? <>
                                {formErrors.email === FieldError.Missing &&
                                    <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>}
                                {formErrors.email === FieldError.InvalidFormat &&
                                    <p className="text-danger font-semibold">Toto není email</p>}
                                {formErrors.email === FieldError.InvalidResponse &&
                                    <p className="text-danger font-semibold">Špatný email / heslo</p>}
                                {formErrors.email === FieldError.None &&
                                    <p className="text-danger font-semibold invisible">L</p>}
                            </>
                            : <p className="invisible">L</p>
                        }
                    </div>
                    <div className="mb-1">
                        <label htmlFor="password"
                               className="block mb-1 text-sm font-medium text-gray-900 dark:text-darkread">{t('password')}</label>
                        <Input
                            type="password"
                            id="password"
                            className="mb-1"
                            value={formData.password}
                            onChange={passwordChanged}/>

                        <div className="flex flex-row justify-between items-start mb-5">
                            {formShowError.password
                                ? <>
                                    {formErrors.password === FieldError.Missing &&
                                        <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>}
                                    {formErrors.password === FieldError.InvalidResponse &&
                                        <p className="text-danger font-semibold">Špatný email / heslo</p>}
                                    {formErrors.password === FieldError.None &&
                                        <p className="text-danger font-semibold invisible">L</p>}
                                </>
                                : <p className="invisible">L</p>
                            }
                            <BtnTextPrimary className="text-sm"
                                            onClick={forgottenPasswordBtnClicked}>{t('forgotten-password-btn')}</BtnTextPrimary>
                        </div>

                    </div>
                    <div className="flex flex-col">
                        <BtnPrimary className="w-full mb-2" onClick={loginBtnClicked}>{t('login-btn')}</BtnPrimary>
                        <span>{t('no-account-msg')} <BtnTextPrimary
                            onClick={regBtnClicked}>{t('register-btn')}</BtnTextPrimary></span>
                    </div>
                </Card>
            </div>
        )
    return <></>
}

interface FormData {
    email: string,
    password: string
}

interface FormErrors {
    email: FieldError,
    password: FieldError
}

enum FieldError {
    None,
    Missing,
    InvalidFormat,
    InvalidResponse
}

interface FormShowError {
    srv: boolean,
    email: boolean,
    password: boolean
}