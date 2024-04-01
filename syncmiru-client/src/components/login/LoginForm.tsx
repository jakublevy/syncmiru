import {ReactElement} from "react";
import LoginFormMain from "@components/login/LoginFormMain.tsx";
import HomeServer from "@components/login/HomeServer.tsx";

export default function LoginForm(): ReactElement {
    return (
        <>
        <LoginFormMain/>
        <HomeServer/>
        </>
    )
}