import {ReactElement, Suspense} from "react";
import Loading from "../Loading.tsx";
import Deps from "./Deps.tsx";

export default function DepsAgain(): ReactElement {
    return (
        <Suspense fallback={<Loading/>}>
            <Deps/>
        </Suspense>
    )
}