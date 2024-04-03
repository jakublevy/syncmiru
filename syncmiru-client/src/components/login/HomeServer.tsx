import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import Input from "@components/widgets/Input.tsx";
import {BackButton} from "@components/widgets/Buttons.tsx";
import {useChangeHomeServer, useHomeServer} from "@hooks/useHomeServer.ts";
import {useLocation} from "wouter";
import {refresh} from "@mittwald/react-use-promise";
import Help from "@components/widgets/Help.tsx";
import {useTranslation} from "react-i18next";
import Card from "@components/widgets/Card.tsx";

export default function HomeServer(): ReactElement {
    const [location, navigate] = useLocation()
    const {t} = useTranslation()
    const [homeSrv, setHomeSrv] = useState<string>('')
    const initHomeSrv = useHomeServer()
    const changeHomeSrv = useChangeHomeServer()

    useEffect(() => {
        setHomeSrv(initHomeSrv)
    }, [initHomeSrv]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): any => {
            if (e.key !== undefined && e.key.toLowerCase() === "enter")
                backButtonClicked()
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [homeSrv]);

    function backButtonClicked() {
        changeHomeSrv(homeSrv).then(() => {
            refresh({tag: "useHomeServer"})
            navigate("/login-form/main")
        })
    }

    function homeSrvInputChanged(e: ChangeEvent<HTMLInputElement>) {
        setHomeSrv(e.target.value)
    }

    if (location === '/login-form/home-server')
        return (
            <div className="flex justify-center items-center h-dvh">
                <Card className="w-[40rem]">
                    <div className="flex items-start">
                        <BackButton onClick={backButtonClicked} className="mr-4"/>
                        <h1 className="text-4xl mb-4">{t('home-srv')}</h1>
                    </div>
                    <p>{t('home-srv-desc')}</p>
                    <div className="mt-4">
                        <div className="flex justify-between">
                            <label htmlFor="srv" className="block mb-1 text-sm font-medium">{t('home-srv')}*</label>
                            <Help
                                tooltipId="srv-help"
                                width="1rem"
                                content={t('home-srv-edit-help')}
                            />
                        </div>
                        <Input
                            type="url"
                            id="srv"
                            onChange={homeSrvInputChanged}
                            value={homeSrv}/>
                    </div>
                </Card>
            </div>
        )
    return <></>
}