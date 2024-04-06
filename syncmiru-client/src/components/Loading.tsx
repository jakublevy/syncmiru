import {ReactElement} from "react";
import {PacmanLoader} from "react-spinners";

export default function Loading(): ReactElement {
    return (
        <div className="flex justify-center items-center m-3">
            <PacmanLoader color="rgb(99 102 241)" />
        </div>
    )
}