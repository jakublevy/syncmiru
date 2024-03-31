import {ReactElement} from "react";
import LanguageSelector from "@components/widgets/LanguageSelector.tsx";
import {BtnPrimary, BtnTextPrimary} from "@components/widgets/Buttons.tsx";

export default function LoginForm(): ReactElement {
    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col pl-6 pr-6 pt-4 pb-4 border-4 m-4 w-[30rem]">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl">Přihlášení</h1>
                    <LanguageSelector className="w-40 ml-4"/>
                </div>

                <form className="w-full">
                    <div className="mb-5 relative">
                        <label htmlFor="srv"
                               className="block mb-1 text-sm font-medium text-gray-900 dark:text-darkread">Domovský
                            server</label>
                        <input type="text" id="srv"
                               className="border-b border-gray-300 text-gray-900 text-sm focus:ring-primary focus:border-primary block w-full p-2.5 bg-white dark:bg-darkbg dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread"
                               required
                               readOnly
                               disabled
                        />
                        <BtnTextPrimary className="text-sm absolute -mt-8 right-1.5">Editovat</BtnTextPrimary>
                        <p className="text-danger invisible font-semibold">Toto pole musí být vyplněno</p>
                    </div>
                    <div className="mb-5">
                        <label htmlFor="login"
                               className="block mb-1 text-sm font-medium">Email
                            nebo uživatelské jméno</label>
                        <input type="email" id="login"
                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread"
                               required/>
                        <p className="text-danger invisible font-semibold">Špatný email / uživatelské jméno</p>
                    </div>
                    <div className="mb-1">
                        <label htmlFor="password"
                               className="block mb-1 text-sm font-medium text-gray-900 dark:text-darkread">Heslo</label>
                        <input type="password" id="password"
                               className="bg-gray-50 mb-1 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-darkread"
                               required/>

                        <div className="flex flex-row justify-between items-start mb-5">
                            <p className="text-danger invisible font-semibold">Špatné heslo</p>
                            <BtnTextPrimary className="text-sm">Zapomenuté heslo?</BtnTextPrimary>
                        </div>

                    </div>
                    <div className="flex flex-col">
                    <BtnPrimary className="w-full mb-2">Přihlásit se</BtnPrimary>
                        <span>Nemáte účet? <BtnTextPrimary>Registrovat</BtnTextPrimary></span>
                    </div>
                </form>
            </div>
        </div>
    )
}