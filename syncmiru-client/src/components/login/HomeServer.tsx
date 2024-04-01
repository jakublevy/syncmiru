import {ReactElement, useEffect, useState} from "react";
import Input from "@components/widgets/Input.tsx";
import {BackButton} from "@components/widgets/Buttons.tsx";
import {useNavigate} from "react-router-dom";
import {useChangeHomeServer, useHomeServer} from "@hooks/useHomeServer.ts";

export default function HomeServer(): ReactElement {
    const navigate = useNavigate()
    const [homeSrv, setHomeSrv] = useState<string>('')
    const initHomeSrv = useHomeServer()
    const changeHomeSrv = useChangeHomeServer()

    useEffect(() => {
        setHomeSrv(initHomeSrv)
    }, [initHomeSrv]);

    function backButtonClicked() {
        changeHomeSrv(homeSrv).then(() => navigate(-1))
    }

    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col pl-6 pr-6 pt-4 pb-4 border-4 m-4 w-[40rem]">
                <div className="flex items-start">
                    <BackButton onClick={backButtonClicked} className="mr-4"/>
                    <h1 className="text-4xl mb-4">Domovský server</h1>
                </div>
                <p>Syncmiru vyžaduje pro svůj běh instanci serveru. Vyplňte do následujícího políčka jeho adresu, nezávisle na tom, zda již účet vlastníte, nebo si ho hodláte vytvořit.</p>
                <div className="mt-4">
                    <label htmlFor="srv" className="block mb-1 text-sm font-medium">Domovský server*</label>
                    <Input type="url" id="srv"/>
                </div>
            </div>
        </div>
    )
}