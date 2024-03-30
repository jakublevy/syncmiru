import {DepsState} from "../../models/config.tsx";
import {ReactElement} from "react";

export default function DepsMissingNoWindows({firstRunSeen, depsState}: {firstRunSeen: boolean, depsState: DepsState}): ReactElement {
    return (
        <div className="flex justify-center items-center h-dvh">
            <div className="flex flex-col p-4 border-4 m-4">
                <h1 className="text-4xl mb-4">Deps missing no Windows</h1>

            </div>
        </div>
    )
}