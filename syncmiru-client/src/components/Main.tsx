import {ReactElement} from "react";
import {useLogin} from "@hooks/useLogin.ts";

export default function Main(): ReactElement {
    const {error: loginError} = useLogin()

    return <div>Main component</div>
}