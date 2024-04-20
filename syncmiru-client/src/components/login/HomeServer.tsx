import {ChangeEvent, ReactElement, useEffect, useState} from "react";
import {Input} from "@components/widgets/Input.tsx";
import {BackBtn} from "@components/widgets/Button.tsx";
import {useChangeHomeServer, useHomeServer} from "@hooks/useHomeServer.ts";
import {useLocation} from "wouter";
import {refresh} from "@mittwald/react-use-promise";
import Help from "@components/widgets/Help.tsx";
import {useTranslation} from "react-i18next";
import Card from "@components/widgets/Card.tsx";
import {mutate} from "swr";
import Label from "@components/widgets/Label.tsx";

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
            mutate('get_service_status', undefined)
            refresh({tag: "useHomeServer"})
            navigate("/login-form/main")
        })
    }

    function homeSrvInputChanged(e: ChangeEvent<HTMLInputElement>) {
        setHomeSrv(e.target.value)
    }

    if (location === '/login-form/home-server')
        return (
            <div className="flex justify-centersafe items-center w-dvw">
                <Card className="min-w-[25rem] w-[40rem] m-3">
                    <div className="flex items-start">
                        <BackBtn onClick={backButtonClicked} className="mr-4"/>
                        <h1 className="text-4xl mb-4">{t('home-srv')}</h1>
                    </div>
                    <p>{t('home-srv-desc')}</p>
                    <div className="mt-4">
                        <div className="flex justify-between">
                            <Label htmlFor="srv">{t('home-srv')}</Label>
                            <Help
                                tooltipId="srv-help"
                                className="w-4"
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