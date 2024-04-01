import {ReactElement, useEffect, useState} from "react";
import LanguageSelector from "@components/widgets/LanguageSelector.tsx";
import {BtnPrimary, BtnTextPrimary} from "@components/widgets/Buttons.tsx";
import Input from "@components/widgets/Input.tsx";
import {useHomeServer} from "@hooks/useHomeServer.ts";
import Label from "@components/widgets/Label.tsx";
import Help from "@components/widgets/Help.tsx";
import {useLocation} from "wouter";
import {useTranslation} from "react-i18next";


export default function LoginFormMain(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
    const homeSrv = useHomeServer()
    const [formState, setFormState]
        = useState<FormState>({homeSrv: '', login: '', password: ''})

    useEffect(() => {
        setFormState({...formState, homeSrv: homeSrv})
    }, [homeSrv]);

    function editClicked() {
        navigate('/login-form/home-server')
    }

    //TODO: možná udělat editaci domovského serveru jako conditional render při kliku na tlačítko editovat,
    // aby tato komponenta ji obsahovala a state vyplněných inputů přetrval

    if(location === '/login-form/main')
    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col pl-6 pr-6 pt-4 pb-4 border-4 m-4 w-[30rem]">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl">{t('login-title')}</h1>
                    <LanguageSelector className="w-40 ml-4"/>
                </div>

                <form className="w-full">
                    <div className="mb-5 relative">
                        <div className="flex justify-between">
                            <Label htmlFor="srv">{t('home-srv')}*</Label>
                            <Help
                                tooltipId="srv-help"
                                width="1rem"
                                content={t('home-srv-login-help')}
                            />
                        </div>
                        <div
                            className="border-b border-gray-300 w-full p-2.5 bg-white dark:bg-darkbg dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread">
                            <input type="text" id="srv"
                                   className="w-[85%] text-gray-900 dark:text-darkread bg-white dark:bg-darkbg text-sm focus:ring-primary focus:border-primary block"
                                   required
                                   readOnly
                                   disabled
                                   value={formState.homeSrv}
                            />
                        </div>
                        <BtnTextPrimary
                            onClick={editClicked}
                            formNoValidate
                            className="text-sm absolute -mt-8 right-1.5">{t('home-srv-edit-btn')}</BtnTextPrimary>
                        <p className="text-danger invisible font-semibold">Toto pole musí být vyplněno</p>
                    </div>
                    <div className="mb-5">
                        <Label htmlFor="login">{t('login-label')}*</Label>
                        <Input
                            type="text"
                            id="login"
                            required
                            value={formState.login}
                            onChange={e => setFormState({...formState, login: e.target.value})}
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
                            value={formState.password}
                            onChange={e => setFormState({...formState, password: e.target.value})}/>
                        <div className="flex flex-row justify-between items-start mb-5">
                            <p className="text-danger invisible font-semibold">Špatné heslo</p>
                            <BtnTextPrimary formNoValidate className="text-sm">{t('forgotten-password-btn')}</BtnTextPrimary>
                        </div>

                    </div>
                    <div className="flex flex-col">
                        <BtnPrimary className="w-full mb-2">{t('login-btn')}</BtnPrimary>
                        <span>{t('no-account-msg')} <BtnTextPrimary formNoValidate>{t('register-btn')}</BtnTextPrimary></span>
                    </div>
                </form>
            </div>
        </div>
    )
    return <></>
}

interface FormState {
    homeSrv: string,
    login: string,
    password: string
}