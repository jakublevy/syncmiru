import {ReactElement} from "react";
import {useTranslation} from "react-i18next";

export default function Syncmiru(): ReactElement {
    const {t} = useTranslation()

    return (
        <div className="flex flex-col">
            <div className="flex items-center m-8">
                <h1 className="text-2xl font-bold">{t('license-syncmiru-title')}</h1>
            </div>
            <div className="flex flex-col ml-8 mr-8 mb-8 gap-y-6">
                <p>{t('license-syncmiru-text')}</p>
                <div className="flex items-center">
                    <p className="w-56">Autor</p>
                    <p className="font-bold">Jakub Levý</p>
                </div>
                <div className="flex items-center">
                    <p className="w-56">Vedoucí</p>
                    <p className="font-bold">RNDr. Martin Svoboda, Ph.D.</p>
                </div>
                <div className="flex items-center">
                    <p className="w-56">Licence</p>
                    <p className="font-bold">MIT</p>
                </div>
            </div>
        </div>
    )
}