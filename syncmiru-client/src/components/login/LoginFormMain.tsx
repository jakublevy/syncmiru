import {ReactElement, useEffect, useState} from "react";
import LanguageSelector from "@components/widgets/LanguageSelector.tsx";
import {BtnPrimary, BtnTextPrimary} from "@components/widgets/Buttons.tsx";
import Input from "@components/widgets/Input.tsx";
import {useHomeServer} from "@hooks/useHomeServer.ts";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";
import Card from "@components/widgets/Card.tsx";
import {useServiceStatus} from "@hooks/useServiceStatus.ts";
import {sleep} from 'src/utils.ts'
import usePasswordValidate from "@hooks/usePasswordValidate.ts";
import useEmailValidate from "@hooks/useEmailValidate.tsx";


export default function LoginFormMain(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()

    const homeSrv = useHomeServer()
    const {
        data: homeSrvServiceStatus,
        isLoading: homeSrvServiceIsLoading,
        error: homeSrvServiceError
    } = useServiceStatus()

    const [highlightInvalidSrv, setHighlightInvalidSrv] = useState<boolean>(false);
    const [isSrvBlinking, setIsSrvBlinking] = useState<boolean>(false);

    const [formData, setFormData]
        = useState<FormData>({email: '', password: ''})

    const passwordValidate = usePasswordValidate()
    const emailValidate = useEmailValidate()

    useEffect(() => {
        setFormData({...formData})
    }, [homeSrv]);

    useEffect(() => {
        setHighlightInvalidSrv(false)
    }, [homeSrvServiceStatus]);


    function editClicked() {
        navigate('/login-form/home-server')
        setHighlightInvalidSrv(false)
    }

    function displayInvalidHomeSrv() {
        if (highlightInvalidSrv) {
            setIsSrvBlinking(true)
            setHighlightInvalidSrv(false)
            sleep(200).then(() => {
                setHighlightInvalidSrv(true)
                setIsSrvBlinking(false)
            })
        } else
            setHighlightInvalidSrv(true)
    }

    function checkHomeServer() {
        const error = homeSrvServiceError || homeSrv === ""
        if(error) {
            displayInvalidHomeSrv()
            return false
        }
        return true
    }

    async function regBtnClicked() {
        if(!checkHomeServer())
            return

        navigate('/register')
    }

    async function loginBtnClicked() {
        if(!checkHomeServer())
            return
    }

    async function forgottenPasswordBtnClicked() {
        if(!checkHomeServer())
            return
    }

    if (location === '/login-form/main')
        return (
            <div className="flex justify-center items-center h-dvh">
                <Card className="w-[30rem]">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl">{t('login-title')}</h1>
                        <LanguageSelector className="w-40 ml-4"/>
                    </div>
                    <div className="mb-5 relative">
                        <div className="flex justify-between">
                            <Label htmlFor="srv">{t('home-srv')}*</Label>
                            <Help
                                tooltipId="srv-help"
                                className="w-4"
                                content={t('home-srv-login-help')}
                            />
                        </div>
                        <div
                            className={`${highlightInvalidSrv ? "border-2 border-danger -mt-0.5 -ml-0.5 -mr-0.5 -mb-[1px]" : "border-b border-gray-300 dark:border-gray-600"} w-full p-2.5 bg-white dark:bg-darkbg dark:placeholder-gray-400 dark:text-darkread`}>
                            <input type="text" id="srv"
                                   className="w-[85%] text-gray-900 dark:text-darkread bg-white dark:bg-darkbg text-sm focus:ring-primary focus:border-primary block"
                                   required
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
                                {highlightInvalidSrv || isSrvBlinking
                                    ? <p className="text-danger font-semibold">Toto pole musí být vyplněno</p>
                                    : <p className="invisible">L</p>
                                }
                            </>
                            : <>
                                {homeSrvServiceIsLoading && !homeSrvServiceError &&
                                    <p className="invisible">L</p>}
                                {homeSrvServiceError &&
                                    <p className="text-danger font-semibold">Instance serveru nebyla nalezena,
                                        zkontrolujte adresu</p>}
                                {!homeSrvServiceError && !homeSrvServiceIsLoading &&
                                    <p className="text-emerald-500 font-semibold">Server nalezen</p>}
                            </>
                        }
                    </div>
                    <div className="mb-5">
                        <div className="flex justify-between">
                            <Label htmlFor="email">{t('email-label')}*</Label>
                            <Help
                                tooltipId="email-help"
                                className="w-4"
                                content="Váš email, který jste použili pro registraci.<br>Toto pole vyplňte i v případě, kdy si chcete obnovit heslo."
                            />
                        </div>
                        <Input
                            type="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        <p className="text-danger invisible font-semibold">Špatný email / uživatelské jméno</p>
                    </div>
                    <div className="mb-1">
                        <label htmlFor="password"
                               className="block mb-1 text-sm font-medium text-gray-900 dark:text-darkread">{t('password')}*</label>
                        <Input
                            type="password"
                            id="password"
                            className="mb-1"
                            required
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}/>
                        <div className="flex flex-row justify-between items-start mb-5">
                            <p className="text-danger invisible font-semibold">Špatné heslo</p>
                            <BtnTextPrimary className="text-sm" onClick={forgottenPasswordBtnClicked}>{t('forgotten-password-btn')}</BtnTextPrimary>
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