import {ReactElement} from "react";
import {PacmanLoader} from "react-spinners";
import {BtnSecondary} from "@components/widgets/Button.tsx";

export default function Reconnecting(): ReactElement {
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-grow flex-col justify-end items-center">
                <PacmanLoader color="rgb(99 102 241)"/>
                <h1 className="text-2xl">Byl jste odpojen</h1>
                <p className="mt-2 font-light">Probíhá pokus o připojení zpět</p>
            </div>
            <div className="flex-grow flex flex-col justify-end items-center mb-4">
                <p className="mb-1">Nedaří se připojit zpět?</p>
                <BtnSecondary>Odhlásit se</BtnSecondary>
            </div>
        </div>
    )
}