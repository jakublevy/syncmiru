import {ReactElement, useState} from "react";
import {PacmanLoader} from "react-spinners";
import {BtnSecondary} from "@components/widgets/Button.tsx";
import {useLocation} from "wouter";
import Loading from "@components/Loading.tsx";
import {invoke} from "@tauri-apps/api/core";

export default function Reconnecting(): ReactElement {
    const [_, navigate] = useLocation()
    const [loading, setLoading] = useState<boolean>(false)

    function signout() {
        setLoading(true)
        invoke<void>('clear_jwt').then(() => {
            navigate('/login-form/main')
        })
    }
    if(loading)
        return <Loading/>

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-grow flex-col justify-end items-center">
                <PacmanLoader color="rgb(99 102 241)"/>
                <h1 className="text-2xl">Byl jste odpojen</h1>
                <p className="mt-2 font-light">Probíhá pokus o připojení zpět</p>
            </div>
            <div className="flex-grow flex flex-col justify-end items-center mb-4">
                <p className="mb-1">Nedaří se připojit zpět?</p>
                <BtnSecondary onClick={signout}>Odhlásit se</BtnSecondary>
            </div>
        </div>
    )
}