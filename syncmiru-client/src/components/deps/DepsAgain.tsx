import {ReactElement, Suspense} from "react";
import Loading from "@components/Loading.tsx";
import Deps from "@components/deps/Deps.tsx";

export default function DepsAgain(): ReactElement {
    return (
        <Suspense fallback={<Loading/>}>
            <Deps/>
        </Suspense>
    )
}