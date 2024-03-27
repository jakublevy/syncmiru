import {ReactElement} from "react";
import {PacmanLoader} from "react-spinners";

export default function Loading(): ReactElement {
    return (
        <div className="flex h-dvh justify-center items-center">
            <PacmanLoader color="rgb(99 102 241)" />
        </div>
    )
}